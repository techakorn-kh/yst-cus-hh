const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md101Companies, md102WebServices, md103Locations } = require('../models/index');
const encodeUrl = require('../uitls/encodeUrl');

module.exports = {
    getData: async(req, res) => {
        try {
            const [company, service] = await Promise.all([
                await md101Companies.findAll({
                    attributes: ['name','uuid'],
                    raw: true
                }),
                await md102WebServices.findOne({
                    where: {
                        api_name: `GetLocation`
                    },
                    raw: true
                })
            ]);

            if(company.length > 0) {
                for (let i in company) {
                    const credentials = {
                        username: config.NAV_USERNAME,
                        password: config.NAV_PASSWORD,
                        domain: config.NAV_DOMIAN
                    };
        
                    const configApi =  {
                        baseURL: encodeUrl(`${service.api_link}`, `${company[i]?.name}`),
                        method: "get"
                    };
                    
                    try {
                        const client = NtlmClient(credentials, configApi);
                        const response = await client.get(`${configApi.baseURL}`);
        
                        if(response.data) {
                            const arr = response.data.value;
        
                            const result = arr.map((item) => {
                                return {
                                    location_code: item?.Code,
                                    location_name: item?.Name,
                                    company_id: company[i]?.uuid
                                }
                            });
        
                            if(result.length > 0) {
                                await md103Locations.destroy({ truncate: true });
        
                                await md103Locations.bulkCreate(result).catch((err) => {
                                    throw err;
                                });
                            }
        
                            return req ? res.json(result) : console.log(result);
                        }
                    } catch (err) {
                        throw err;
                    }
                }
            }
            
            return res.json([company, service]);
        } catch (err) {
            console.error(err);
            return req ? res.send(err) : console.error(err);
        }
    }
}