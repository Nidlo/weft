export interface GqlUser {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
  city: string | null;
  isVerified: boolean;
}

export interface RequestOtpData {
  requestOtp: {
    success: boolean;
    message: string;
  };
}

export interface VerifyOtpData {
  verifyOtp: {
    token: string;
    isNew: boolean;
    user: GqlUser;
  };
}

export interface SocialLoginData {
  socialLogin: {
    token: string;
    isNew: boolean;
    user: GqlUser;
  };
}

export interface SelectRoleData {
  selectRole: {
    id: string;
    name: string | null;
    role: string | null;
    profile: { id: string } | null;
  };
}

export interface MeData {
  me: GqlUser;
}

export interface LogoutData {
  logout: boolean;
}
