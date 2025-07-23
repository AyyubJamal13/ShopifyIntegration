

export async function loginUser(ShopName) {
  const url = `${process.env.WEBHOOK_BASE_URL}/api/Auth/applogin`;


  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "raytest@gmail.com",
        password: "string",
        storeName: ShopName
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }else{
      return true;
    }

    //const data = await response.json();

    if (data.success) {
      console.log('Login successful!', data);
      return true;
    } else {
      console.log('Invalid credentials.');
      return false;
    }

  } catch (error) {
    console.error('Error during login:', error.message);
    return false;
  }
}