declare global {
	namespace NodeJS {
	  interface ProcessEnv {
		APP_ENV: string;
		V1_API_ENDPOINT: string;
	  }
	}
  }
  
  export {}
  