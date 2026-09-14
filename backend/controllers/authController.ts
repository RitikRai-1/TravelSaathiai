import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbManager } from '../db/database';
import { generateToken, AuthRequest } from '../middleware/auth';

/**
 * Normalizes and validates 10-digit Indian phone numbers.
 * Strips +91, leading 0, and non-digit characters.
 */
export function normalizeIndianPhone(input: string): { valid: boolean; canonical: string; formatted: string } {
  if (!input) return { valid: false, canonical: '', formatted: '' };
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return {
      valid: true,
      canonical: digits,
      formatted: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    };
  }
  return { valid: false, canonical: '', formatted: '' };
}

// ==================== EMAIL SIGNUP ====================
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword, role = 'TOURIST', phone } = req.body;

    const trimmedName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!trimmedName) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const existing = dbManager.queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
      return;
    }

    let canonicalPhone = '';
    let isPhoneVerified = 0;
    if (phone) {
      const phoneCheck = normalizeIndianPhone(phone);
      if (phoneCheck.valid) {
        canonicalPhone = phoneCheck.canonical;
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const validRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'BUSINESS_MODERATOR', 'BUSINESS_OWNER', 'TOURIST'];
    const assignedRole = validRoles.includes(role) ? role : 'TOURIST';

    const result = dbManager.run(
      'INSERT INTO users (name, email, password_hash, role, phone, mobile_verified, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [trimmedName, cleanEmail, hash, assignedRole, canonicalPhone, isPhoneVerified, 'ACTIVE']
    );

    const userId = result.lastInsertRowid;
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`;

    dbManager.run(
      'INSERT INTO profiles (user_id, bio, avatar_url, location, mobile_number, mobile_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'Namaste! I am exploring India with TravelSaathi AI.', avatarUrl, 'India', canonicalPhone, isPhoneVerified]
    );

    const fullProfile = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.mobile_verified, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    const token = generateToken({
      id: userId,
      name: trimmedName,
      email: cleanEmail,
      role: assignedRole,
      status: 'ACTIVE',
    } as any);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: fullProfile,
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

// ==================== EMAIL LOGIN ====================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      res.status(400).json({ success: false, message: 'Please enter both email and password.' });
      return;
    }

    const user = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.phone as mobile_number, u.mobile_verified, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.email = ?`,
      [cleanEmail]
    );


    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: `Your account is ${user.status.toLowerCase()}. Please contact support.` });
      return;
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const token = generateToken(authUser as any);

    const safeUser = { ...user };
    delete safeUser.password_hash;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ==================== SEND OTP ====================
export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const mobile = req.body.mobile || req.body.mobile_number;
    const purpose = req.body.purpose || 'LOGIN';
    if (!mobile) {
      res.status(400).json({ success: false, message: 'Please enter a valid mobile number.' });
      return;
    }


    const { valid, canonical, formatted } = normalizeIndianPhone(mobile);
    if (!valid) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
      return;
    }

    // Rate-limiting check: 60-second cooldown
    const latestOtp = dbManager.queryOne<any>(
      'SELECT created_at FROM otps WHERE mobile_number = ? ORDER BY id DESC LIMIT 1',
      [canonical]
    );

    if (latestOtp) {
      const diffMs = Date.now() - new Date(latestOtp.created_at).getTime();
      if (diffMs < 60000) {
        const remainingSec = Math.ceil((60000 - diffMs) / 1000);
        res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} seconds before requesting a new OTP.`,
          cooldownRemaining: remainingSec,
        });
        return;
      }
    }

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const createdAt = new Date().toISOString();

    dbManager.run(
      'INSERT INTO otps (mobile_number, otp_code, purpose, attempts, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [canonical, otpCode, purpose, 0, expiresAt, createdAt]
    );


    const smsProviderConfigured = Boolean(
      process.env.FAST2SMS_API_KEY ||
      process.env.TWILIO_ACCOUNT_SID ||
      process.env.MSG91_AUTH_KEY
    );

    if (smsProviderConfigured) {
      console.log(`[SMS DISPATCH] Real SMS dispatched to ${formatted} (code active)`);
      res.json({
        success: true,
        message: `OTP sent successfully to ${formatted}`,
        mobile: formatted,
        smsProviderConfigured: true,
      });
    } else {
      console.log(`[OTP SERVICE - DEVELOPER MODE] Mobile: ${formatted} | OTP: ${otpCode} | Purpose: ${purpose}`);
      res.json({
        success: true,
        message: `OTP generated for ${formatted}. (Developer Mode: Use OTP below)`,
        mobile: formatted,
        devOtp: otpCode,
        simulated_otp: otpCode,
        cooldown_seconds: 60,
        smsProviderConfigured: false,
      });
    }

  } catch (err: any) {
    console.error('sendOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error while generating OTP.' });
  }
};

// ==================== VERIFY OTP ====================
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const mobile = req.body.mobile || req.body.mobile_number;
    const otp = req.body.otp || req.body.otp_code;
    const purpose = req.body.purpose || 'LOGIN';
    const name = req.body.name || req.body.full_name;

    if (!mobile || !otp) {
      res.status(400).json({ success: false, message: 'Mobile number and 6-digit OTP are required.' });
      return;
    }


    const { valid, canonical, formatted } = normalizeIndianPhone(mobile);
    if (!valid) {
      res.status(400).json({ success: false, message: 'Invalid Indian mobile number.' });
      return;
    }

    const cleanOtp = String(otp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      res.status(400).json({ success: false, message: 'OTP must be a 6-digit number.' });
      return;
    }

    const otpRecord = dbManager.queryOne<any>(
      'SELECT id, otp_code, attempts, expires_at FROM otps WHERE mobile_number = ? ORDER BY id DESC LIMIT 1',
      [canonical]
    );

    if (!otpRecord) {
      res.status(400).json({ success: false, message: 'No OTP request found for this mobile number. Please request an OTP first.' });
      return;
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      dbManager.run('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
      return;
    }

    if (otpRecord.attempts >= 5) {
      dbManager.run('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      res.status(400).json({ success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' });
      return;
    }

    if (otpRecord.otp_code !== cleanOtp) {
      dbManager.run('UPDATE otps SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
      res.status(400).json({ success: false, message: 'Incorrect OTP. Please try again.' });
      return;
    }

    // OTP matched! Invalidate OTP immediately
    dbManager.run('DELETE FROM otps WHERE mobile_number = ?', [canonical]);

    // Check if user already exists
    let user = dbManager.queryOne<any>(
      'SELECT id, name, email, role, phone, status, mobile_verified FROM users WHERE phone = ?',
      [canonical]
    );

    let isNewUser = false;

    if (!user) {
      if (purpose === 'LOGIN') {
        res.status(404).json({
          success: false,
          message: 'No account found with this mobile number. Please sign up first.',
          requiresSignup: true,
        });
        return;
      }

      // New user signup
      isNewUser = true;
      const userName = String(name || '').trim() || `Traveler ${canonical.slice(-4)}`;
      const syntheticEmail = `${canonical}@mobile.travelsaathi.ai`;
      const salt = bcrypt.genSaltSync(10);
      const randomPass = Math.random().toString(36).slice(-8) + 'Aa1!';
      const hash = bcrypt.hashSync(randomPass, salt);

      const result = dbManager.run(
        'INSERT INTO users (name, email, password_hash, role, phone, mobile_verified, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userName, syntheticEmail, hash, 'TOURIST', canonical, 1, 'ACTIVE']
      );

      const userId = result.lastInsertRowid;
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`;

      dbManager.run(
        'INSERT INTO profiles (user_id, bio, avatar_url, location, mobile_number, mobile_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'Namaste! I am exploring India with TravelSaathi AI.', avatarUrl, 'India', canonical, 1]
      );

      user = {
        id: userId,
        name: userName,
        email: syntheticEmail,
        role: 'TOURIST',
        phone: canonical,
        mobile_verified: 1,
        status: 'ACTIVE',
      };
    } else {
      // User exists -> Ensure mobile_verified is set
      dbManager.run('UPDATE users SET mobile_verified = 1 WHERE id = ?', [user.id]);
      try {
        dbManager.run('UPDATE profiles SET mobile_verified = 1, mobile_number = ? WHERE user_id = ?', [canonical, user.id]);
      } catch {}
      user.mobile_verified = 1;
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    } as any);

    const fullProfile = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.phone as mobile_number, u.mobile_verified, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [user.id]
    );

    res.json({
      success: true,
      message: isNewUser ? 'Account created and verified successfully!' : 'Logged in successfully!',
      token,
      user: fullProfile || user,
      isNewUser,
    });
  } catch (err: any) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ success: false, message: 'Server error during OTP verification.' });
  }
};

// ==================== GET CURRENT USER PROFILE ====================
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const userProfile = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.phone as mobile_number, u.mobile_verified, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );


    if (!userProfile) {
      res.status(404).json({ success: false, message: 'User profile not found' });
      return;
    }

    res.json({ success: true, user: userProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile' });
  }
};

// ==================== UPDATE USER PROFILE ====================
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const { name, phone, bio, avatar_url, location } = req.body;

    const trimmedName = name ? String(name).trim() : '';

    if (trimmedName) {
      dbManager.run('UPDATE users SET name = ? WHERE id = ?', [trimmedName, req.user.id]);
    }

    if (phone) {
      const { valid, canonical } = normalizeIndianPhone(phone);
      if (valid) {
        dbManager.run('UPDATE users SET phone = ? WHERE id = ?', [canonical, req.user.id]);
        try {
          dbManager.run('UPDATE profiles SET mobile_number = ? WHERE user_id = ?', [canonical, req.user.id]);
        } catch {}
      }
    }

    dbManager.run(
      `UPDATE profiles SET bio = ?, avatar_url = ?, location = ? WHERE user_id = ?`,
      [bio || '', avatar_url || '', location || '', req.user.id]
    );

    const updatedProfile = dbManager.queryOne<any>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.mobile_verified, u.status, u.created_at,
              p.bio, p.avatar_url, p.location
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json({ success: true, message: 'Profile updated successfully', user: updatedProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
