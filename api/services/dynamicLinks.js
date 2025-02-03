const axios = require("axios");

const fetchLinks = async (req, res) => {
    const { id } = req.params; // Dynamic ID from the route
    const userAgent = req.headers['user-agent']; // Get the user agent from the request headers
  
    try {
      // Call an external API to fetch links based on the dynamic ID
      const response = await axios.get(`https://toolbox.boomlive.in/api_project/aditya_linkgenerator.php?id=${id}`);
        
      if (!response.data || !response.data.links) {
        return res.status(404).json({ error: 'Links not found' });
      }
      console.log(response.data)
      // Get the appropriate link based on the user agent
      let link = response.data.links.default;
  
      // Check if the user agent corresponds to a specific device/browser
      if (userAgent.includes('iPhone')) {
        link = response.data.links.apple;
      } else if (userAgent.includes('Android')) {
        link = response.data.links.spotify;
      } else  {
        link = response.data.links.youtube;
      }
  
      res.status(200).json({ link }); // Return the appropriate link based on the user agent
    } catch (error) {
      console.error('Error fetching links:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
module.exports = {
    fetchLinks,
};
