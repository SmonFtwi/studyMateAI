/* eslint-disable @typescript-eslint/no-explicit-any */

export const handleChat = async (query:any, sessionId:string, token:string, selectedMode:string) => {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                

            },
            body: JSON.stringify({query, sessionId, llmtype:selectedMode}),
        });

        if (!response.ok) {
            console.log("error", response)
        }
        
        const data = await response.json();
        return data;

    }
    catch(error)
    {
        console.error('Error handling chat:', error);
    }
}


export const listChatHistory = async (token: string) => {
    console.log("cheking if the code reach here")
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_backend_url}/listChats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        console.error("Error fetching chat history:", response.statusText);
        throw new Error("Failed to fetch chat history");
      }
  
      const data = await response.json();
      return data; // Returning the parsed JSON response
    } catch (error) {
      console.error("Error in listChatHistory:", error);
      throw error; // Rethrowing the error to handle it in the calling function
    }
  };


 export const fetchChatContent = async (session_id:any, token:string) => {

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/fetchChatContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                

            },
            body: JSON.stringify({ session_id}),
        });

        if (!response.ok) {
            console.log("error", response)
        }
        
        const data = await response.json();
        console.log("data", data)
        return data;

    }
    catch(error)
    {
        console.error('Error handling chat:', error);
    }
}

export const deleteChat = async(session_id:any, token:string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/deleteChat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            

        },
        body: JSON.stringify({ session_id}),
    });

    if (!response.ok) {
        console.log("error", response)
    }
    
    const data = await response.json();
    console.log("data", data)
    return data;

}
catch(error)
{
    console.error('Error handling chat:', error);
}
}
  