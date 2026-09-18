export const registerUser = async (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/users/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || data.detail || "Registration failed. Please try again.",
    );
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_backend_url}/users/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );
  return response;
};

export const checkUserAuth = async (token: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_backend_url}/users/checkAuth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      },
    );
    if (!res.ok) {
      console.error("registration failed", res);
    }
    const data = await res.json();
    return data;
  } catch {
    console.log("error");
  }
};
