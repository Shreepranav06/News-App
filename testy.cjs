const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://cricbuzz-cricket.p.rapidapi.com/stats/v1/series/3718/points-table',
  headers: {
    'x-rapidapi-key': 'a1b5987cffmsh1bab8f14268620bp10db03jsn5a8135a79eba',
    'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com'
  }
};

async function fetchData() {
	try {
		const response = await axios.request(options);
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

fetchData();