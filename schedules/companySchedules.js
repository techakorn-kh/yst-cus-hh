const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md101Companies } = require('../models/index');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    getData: async(req, res) => {
        try {
            const credentials = {
                username: config.NAV_USERNAME,
                password: config.NAV_PASSWORD,
                domain: config.NAV_DOMIAN
            };

            const configApi =  {
                baseURL: config.NAV_API,
                method: "get"
            };

            try {
                const client = NtlmClient(credentials, configApi);
                const response = await client.get(`${configApi.baseURL}`);

                if(response.data) {
                    const arr = response.data.value, arrA = [];

                    const result = arr.map((item) => {
                        return {
                            name: item?.Name,
                            display_name: item?.Display_Name,
                            uuid: uuidv4(`${item?.Name}${item?.Display_Name}`)
                        }
                    });

                    if(result.length > 0) {
                        await md101Companies.destroy({ truncate: true });

                        await md101Companies.bulkCreate(result).catch((err) => {
                            throw err;
                        });
                    }

                    return req ? res.json(result) : console.log(result);
                }
            } catch (err) {
                throw err;
            }
        } catch (err) {
            console.error(err);
            return req ? res.send(err) : console.error(err);
        }
    }
}