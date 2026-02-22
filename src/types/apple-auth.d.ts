interface AppleSignInAPI {
  auth: {
    init: (config: {
      clientId: string;
      scope: string;
      redirectURI: string;
      usePopup: boolean;
    }) => void;
    signIn: () => Promise<{
      authorization: {
        id_token: string;
        code: string;
      };
      user?: {
        name?: {
          firstName?: string;
          lastName?: string;
        };
        email?: string;
      };
    }>;
  };
}

interface Window {
  AppleID?: AppleSignInAPI;
}
