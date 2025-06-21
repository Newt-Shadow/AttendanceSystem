export async function checkVPN(ip: string): Promise<boolean> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/?key=${process.env.IPAPI_KEY}`);
    const data = await response.json();
    return data.vpn || data.proxy || data.tor;
  } catch {
    return false;
  }
}