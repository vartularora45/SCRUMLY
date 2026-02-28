import axios from "axios";

export const jiraCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    const response = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.JIRA_REDIRECT_URI,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    console.log("✅ Jira Access Token:", access_token);

    // TODO → Save tokens in DB
    // await Integration.create({...})

    res.send("Jira connected successfully 🚀");
  } catch (error) {
    console.error("❌ Jira Callback Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "Jira OAuth failed",
      error: error.response?.data || error.message,
    });
  }
};


export const connectToJira = (req, res) => {
  try {
    const clientId = process.env.JIRA_CLIENT_ID;
    const redirectUri = process.env.JIRA_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        message: "Jira OAuth env vars missing",
      });
    }

    const scope = [
      "read:jira-work",
      "write:jira-work",
      "offline_access"
    ].join(" ");

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=consent`;

    console.log("🔗 Redirecting to Jira OAuth");

    res.redirect(authUrl);
  } catch (error) {
    console.error("❌ Jira Connect Error:", error.message);

    res.status(500).json({
      message: "Failed to initiate Jira OAuth",
    });
  }
};
