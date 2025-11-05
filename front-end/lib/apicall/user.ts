
 

 export const registerUser = async(formData:any) => {
  
  try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    if (!res.ok){
      console.error("registration failed", res)
    }
    const data= await res.json();
    return data;
  }catch(err) {
    console.log("error");
  }

 }


export const  loginUser =  async (email: string, password: string) =>  {
  const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return response;
}


export const checkUserAuth = async (token:string)=> {

  try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/users/checkAuth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({token})
    })
    if (!res.ok){
      console.error("registration failed", res)
    }
    const data= await res.json();
    return data;
  }catch(err) {
    console.log("error");
  }

}