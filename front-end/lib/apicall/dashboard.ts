

export const getDailyMessages = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/dash/daily-messages`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Error fetching daily messages:", response.statusText);
        throw new Error("Failed to fetch daily messages");
      }
  
      const data = await response.json();
      console.log("daily message", data)
      return data;
    } catch (error) {
      console.error("Error in getDailyMessages:", error);
      throw error;
    }
  };

  
  export const getUserRegistrations = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/dash/user-message`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Error fetching user registrations:", response.statusText);
        throw new Error("Failed to fetch user registrations");
      }
  
      const data = await response.json();
      console.log("registed user", data)
      return data;
    } catch (error) {
      console.error("Error in getUserRegistrations:", error);
      throw error;
    }
  };

  
  export const getFilesUploaded = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/dash/files-uploaded`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Error fetching files uploaded:", response.statusText);
        throw new Error("Failed to fetch files uploaded");
      }
  
      const data = await response.json();
      console.log("file uploaded", data)
      return data;
    } catch (error) {
      console.error("Error in getFilesUploaded:", error);
      throw error;
    }
  };

  
  export const getDailySessions = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/dash/daily-sessions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Error fetching daily sessions:", response.statusText);
        throw new Error("Failed to fetch daily sessions");
      }
  
      const data = await response.json();
      console.log("daily sessions", data)
      return data;
    } catch (error) {
      console.error("Error in getDailySessions:", error);
      throw error;
    }
  };
  