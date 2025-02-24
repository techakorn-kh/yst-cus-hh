const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md102WebServices } = require('../models/index');
const encodeUrl = require('../uitls/encodeUrl');
const moment = require('moment');

const getFixedAssetMaster = async (req) => {
    const { No, company } = req.params;

    const service = await md102WebServices.findOne({
        where: {
            api_name: `GetFixedAssetMaster`
        },
        raw: true
    }).catch((err)=>{
        throw err;
    });

    const credentials = {
        username: config.NAV_USERNAME,
        password: config.NAV_PASSWORD,
        domain: config.NAV_DOMIAN
    };

    const configApi =  {
        baseURL: encodeUrl(`${service.api_link}`, `${company}`),
        method: "get"
    };

    const filters = `${configApi.baseURL}?$filter=No eq '${No}'`
   
    try {
        const client = NtlmClient(credentials, configApi);
        const response = await client.get(`${filters}`);

        if(response.data) {
            const arr = response.data.value;

            const result = arr.map((item) => {
                return {
                    fixed_asset_no: item?.No,
                    description: item?.Description,
                    dimension: item?.Global_Dimension_1_Code,
                    location_code: item?.Location_Code,
                    book_value: Number(Number(item?._Book_Value).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    acquisition_date: item?.Acquisition_Date,
                    acquisition_cost: Number(Number(item?.Acquisition_Cost).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                }
            });

            if(result.length > 0) {
                return result[0];
            } else {
                throw `The fixed asset you are looking for was not found.`;
            }
        }
    } catch (err) {
        throw err;
    }
}

module.exports = {
    index: async(req, res) => {
        try {
            return res.render('pages/fixed-asset-card/index', { 
                title: 'Fixed Asset Card'
            });
        } catch (err) {
            console.error(err);
        }
    },
    getByUnique: async(req, res) => {
        try {
            const result = await getFixedAssetMaster(req).catch((err)=>{
                throw err;
            });

            return res.render('pages/fixed-asset-card/view', { 
                title: 'Fixed Asset Card',
                result,
                moment
            });
        } catch (err) {
            console.error(err);
        }
    },
    search: async(req, res) => {
        try {
            const result = await getFixedAssetMaster(req).catch((err)=>{
                throw err;
            });

            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Welcome to the system', 
                data: result
            });

        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    }
}