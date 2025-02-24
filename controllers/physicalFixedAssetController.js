const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md101Companies, md102WebServices, md103Locations, wh100PhysicalFixedAssetHead, wh101PhysicalFixedAssetDetail } = require('../models/index');
const encodeUrl = require('../uitls/encodeUrl');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { data } = require('jquery');

const getPhysFixedAsset = async (params) => {
    try {
        const { physical_fa_no, company_id, fetch_data } = params;

        const [companys, services] = await Promise.all([
            await md101Companies.findOne({
                attributes: ['name','uuid'],
                where: {
                    uuid: company_id
                },
                raw: true
            }),
            await md102WebServices.findOne({
                where: {
                    api_name: `PhysFixedAsset`
                },
                raw: true
            })
        ]);

        if(!services) throw 'PhysFixedAsset API not found in system.';
        if(!companys) throw 'Your company was not found in the system.';

        if(!fetch_data) {
            const duplicate = await wh100PhysicalFixedAssetHead.findOne({
                where: {
                    physical_fa_no: physical_fa_no,
                    company_id: companys?.uuid
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });   
            
            if(duplicate) throw `${physical_fa_no} This document is already in the system. Created by ${duplicate?.created_by}.`;
        }
        
        const credentials = {
            username: config.NAV_USERNAME,
            password: config.NAV_PASSWORD,
            domain: config.NAV_DOMIAN
        };
    
        const configApi =  {
            baseURL: encodeUrl(`${services.api_link}`, `${companys?.name}`),
            method: "get"
        };
    
        const filters = `${configApi.baseURL}?$filter=Physical_FA_No eq '${physical_fa_no}'`;

        const client = NtlmClient(credentials, configApi);
        const response = await client.get(`${filters}`);

        return {
            arr: response.data.value,
            companys
        };
    } catch (err) {
        throw err;
    }
};

const postPhysFixedAsset = async (params) => {
    try {
        const { company_id, body } = params;

        const [companys, services] = await Promise.all([
            await md101Companies.findOne({
                attributes: ['name','uuid'],
                where: {
                    uuid: company_id
                },
                raw: true
            }),
            await md102WebServices.findOne({
                where: {
                    api_name: `PhysFAUpdate`
                },
                raw: true
            })
        ]);

        if(!services) throw 'PhysFAUpdate API not found in system.';
        if(!companys) throw 'Your company was not found in the system.';

        const credentials = {
            username: config.NAV_USERNAME,
            password: config.NAV_PASSWORD,
            domain: config.NAV_DOMIAN
        };
    
        const configApi = {
            baseURL: encodeUrl(`${services.api_link}`, `${companys?.name}`),
            method: "post"
        };

        const client = NtlmClient(credentials, configApi);
        const response = await client({ 
            url: configApi?.baseURL, 
            data: body 
        });

        return response.data;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    //region index
    index: async(req, res) => {
        try {
            return res.render('pages/physical-fixed-asset/index', { 
                title: 'Physical Fixed Asset'
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region getByUnique
    getByUnique: async(req, res) => {
        try {
            const { physical_fa_no_id, company_id } = req.params;

            const header = await wh100PhysicalFixedAssetHead.findOne({
                where: {
                    uuid: physical_fa_no_id,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const arr = await wh101PhysicalFixedAssetDetail.findAll({
                where: {
                    physical_fa_no_id: physical_fa_no_id,
                    is_checked: true,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const details = arr.map((item) => {
                let statusCode = ``, statusText = ``;

                if(item?.status_ok === 'Yes')  statusCode = `OK`;

                if(item?.status_ng === 'Yes') statusCode = `NG`;

                if(item?.status_loss === 'Yes') statusCode = `LOSS`;

                switch(statusCode) {
                    case 'OK':
                        statusCode = statusText = `OK`;
                        break;

                    case 'NG':
                        statusCode = `NG`;

                        if (item?.request_sale) {
                            statusText = `NG - SALE`;
                        } else {
                            statusText = `NG - DONATION`;
                        }
                        break;

                    case 'LOSS':
                        statusCode = `LOSS`;
                        statusText = `LOSS - WRITE OFF`;
                        break;

                    default: 
                        statusCode = `LOSS`;
                        statusText = `LOSS - WRITE OFF`;
                }

                return {
                    ...item,
                    statusCode,
                    statusText
                };
            });

            const location = await md103Locations.findOne({
                where: {
                    location_code: header?.fa_location_code || null,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const location_code = location && location?.location_code ? location?.location_code : '';
            const location_name = location && location?.location_name ? ` | ${location?.location_name}` : '';

            const pending = await wh101PhysicalFixedAssetDetail.count({
                where: {
                    physical_fa_no_id: physical_fa_no_id,
                    fa_check: false,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const dataset = {
                ...header,
                location: `${location_code}${location_name}`,
                pending
            };

            return res.render('pages/physical-fixed-asset/list', { 
                title: 'Physical Fixed Asset',
                header: dataset,
                params: req.params,
                details,
                moment
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region getPending
    getPending: async(req, res) => {
        try {
            const { physical_fa_no_id, company_id } = req.params;

            const arr = await wh101PhysicalFixedAssetDetail.findAll({
                attributes: [
                    'no','description','department','fa_location_code', 'book_value','status_ok','status_ng','status_loss',
                    'request_sale','request_donation','request_write_off','acquisition_date','acquisition_cost','is_checked'
                ],
                where: {
                    physical_fa_no_id: physical_fa_no_id,
                    fa_check: false,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const details = arr.map((item) => {
                let statusCode = ``, statusText = ``;

                if(item?.status_ok === 'Yes') statusCode = `OK`;

                if(item?.status_ng === 'Yes') statusCode = `NG`;

                if(item?.status_loss === 'Yes') statusCode = `LOSS`;

                switch(statusCode) {
                    case 'OK':
                        statusCode = statusText = `OK`;
                        break;

                    case 'NG':
                        statusCode = `NG`;

                        if (item?.request_sale) {
                            statusText = `NG - SALE`;
                        } else {
                            statusText = `NG - DONATION`;
                        }
                        break;

                    case 'LOSS':
                        statusCode = `LOSS`;
                        statusText = `LOSS - WRITE OFF`;
                        break;

                    default: 
                        statusCode = `LOSS`;
                        statusText = `LOSS - WRITE OFF`;
                }

                return {
                    ...item,
                    book_value: Number(Number(item?.book_value).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    acquisition_cost: Number(Number(item?.acquisition_cost).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    acquisition_date: moment(item?.acquisition_date).format('DD/MM/YYYY'),
                    statusCode,
                    statusText
                };
            });

            return res.render('pages/physical-fixed-asset/pending', { 
                title: 'Pending Fixed Asset',
                details,
                params: req.params
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region getCheckAction
    getCheckAction: async(req, res) => {
        try {
            const { physical_fa_no_id, company_id, no, line_no } = req.params;

            const result = await wh101PhysicalFixedAssetDetail.findOne({
                attributes: ['is_checked','updated_by','updatedAt'],
                where: {
                    physical_fa_no_id,
                    no,
                    line_no,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const dataset = {
                ...result,
                updatedAt: moment(result?.updatedAt).format('DD/MM/YYYY HH:mm')
            };

            return res.json(dataset);
        } catch (err) {
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region viewCard
    viewCard: async(req, res) => {
        try {
            let details;

            const { physical_fa_no_id, company_id, no } = req.params;

            const header = await wh100PhysicalFixedAssetHead.findOne({
                where: {
                    uuid: physical_fa_no_id,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const location = await md103Locations.findOne({
                where: {
                    location_code: header?.fa_location_code,
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const location_code = location && location?.location_code ? location?.location_code : '';
            const location_name = location && location?.location_name ? ` | ${location?.location_name}` : '';

            const dataset = {
                ...header,
                location: `${location_code}${location_name}`
            };

            if(no !== 'null') {
                const result = await wh101PhysicalFixedAssetDetail.findOne({
                    where: {
                        physical_fa_no_id,
                        no,
                        company_id
                    },
                    raw: true
                }).catch((err)=>{
                    throw err;
                });

                if(result?.main_component === 'Main Asset') {
                    const arr = await wh101PhysicalFixedAssetDetail.findAll({
                        where: {
                            physical_fa_no_id,
                            component_of: no,
                            company_id
                        },
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });

                    details = arr.map((item) => {
                        let statusCode = ``, statusText = ``;

                        if(item?.status_ok === 'Yes') statusCode = `OK`;

                        if(item?.status_ng === 'Yes') statusCode = `NG`;

                        if(item?.status_loss === 'Yes') statusCode = `LOSS`;

                        switch(statusCode) {
                            case 'OK':
                                statusCode = statusText = `OK`;
                                break;
        
                            case 'NG':
                                statusCode = `NG`;
        
                                if (item?.request_sale) {
                                    statusText = `NG - SALE`;
                                } else {
                                    statusText = `NG - DONATION`;
                                }
                                break;
        
                            case 'LOSS':
                                statusCode = `LOSS`;
                                statusText = `LOSS - WRITE OFF`;
                                break;
        
                            default: 
                                statusCode = `LOSS`;
                                statusText = `LOSS - WRITE OFF`;
                        }

                        return {
                            ...item,
                            book_value: Number(Number(item?.book_value).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                            acquisition_cost: Number(Number(item?.acquisition_cost).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                            statusCode,
                            statusText
                        };
                    });
                } else {
                    let statusCode = ``, statusText = ``;

                    if(result?.status_ok === 'Yes') statusCode = `OK`;

                    if(result?.status_ng === 'Yes') statusCode = `NG`;

                    if(result?.status_loss === 'Yes') statusCode = `LOSS`;

                    switch(statusCode) {
                        case 'OK':
                            statusCode = statusText = `OK`;
                            break;
    
                        case 'NG':
                            statusCode = `NG`;
    
                            if (result?.request_sale) {
                                statusText = `NG - SALE`;
                            } else {
                                statusText = `NG - DONATION`;
                            }
                            break;
    
                        case 'LOSS':
                            statusCode = `LOSS`;
                            statusText = `LOSS - WRITE OFF`;
                            break;
    
                        default: 
                            statusCode = `LOSS`;
                            statusText = `LOSS - WRITE OFF`;
                    }

                    details = [{
                        ...result,
                        book_value: Number(Number(result?.book_value).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        acquisition_cost: Number(Number(result?.acquisition_cost).toFixed(2)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        statusCode,
                        statusText
                    }];
                }
            }
            
            return res.render('pages/physical-fixed-asset/card', { 
                title: 'Fixed Asset',
                header: dataset,
                details: details || [],
                params: req.params,
                moment
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region update
    update: async(req, res) => {
        try {
            const { physical_fa_no_id, company_id, no, line_no } = req.params, { user } = req.session;

            await wh101PhysicalFixedAssetDetail.update({
                ...req.body,
                is_checked: true,
                updated_by: user
            }, {
                where: {
                    physical_fa_no_id, 
                    company_id, 
                    no, 
                    line_no
                }
            }).catch((err)=>{
                throw err;
            });

            await wh100PhysicalFixedAssetHead.update({ updated_by: user },{
                where: {
                    uuid: physical_fa_no_id,
                    company_id
                }
            }).catch((err)=>{
                throw err;
            });
    
            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Data saved successfully'
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region download
    download: async(req, res) => {
        try {
            const { physical_fa_no, company_id } = req.params, { user } = req.session;

            const { arr, companys } = await getPhysFixedAsset({ physical_fa_no, company_id }).catch((err)=>{
                throw err;
            });   

            const dataset = {}, uuid = uuidv4(`${physical_fa_no}${companys?.uuid}`);

            const result = arr.map((item) => {
                dataset.physical_fa_no = item?.Physical_FA_No; //PK
                dataset.department = item?.Department;
                dataset.fa_location_code = item?.FA_Location_Code;
                dataset.total_check = item?.Total_Check,
                dataset.total_fa = item?.Total_FA,
                dataset.created_by = user;
                dataset.updated_by = user;
                dataset.company_id = companys?.uuid; //PK
                dataset.uuid = uuid; //PK
                    
                return {
                    physical_fa_no_id: uuid, //PK
                    line_no: item?.Line_No, //PK
                    no: item?.No, //PK
                    description: item?.Description,
                    department: item?.Department,
                    fa_location_code: item?.FA_Location_Code,
                    fa_check: item?.FA_Check,
                    book_value: item?.Book_Value,
                    status_ok: item?.Status_OK.trim(),
                    status_ng: item?.Status_NG.trim(),
                    status_loss: item?.Status_LOSS.trim(),
                    request_sale: item?.Request_Sale,
                    request_donation: item?.Request_Donation,
                    request_write_off: item?.Request_Write_Off,
                    remark: item?.Remark,
                    asset_location: item?.Asset_Location,
                    main_component: item?.Main_Component,
                    component_of: item?.Component_of,
                    acquisition_date: item?.Acquisition_Date,
                    acquisition_cost: item?.Acquisition_Cost,
                    is_checked: false,
                    created_by: user,
                    updated_by: user,
                    company_id: companys?.uuid //PK
                }
            });

            if(result.length > 0) {
                await wh100PhysicalFixedAssetHead.findOrCreate({
                    where: {
                        physical_fa_no: dataset?.physical_fa_no,
                        company_id: dataset?.company_id
                    },
                    defaults: dataset
                }).then( async ([ value, created ])=>{
                    if(created) {
                        await wh101PhysicalFixedAssetDetail.bulkCreate(result).catch((err)=>{
                            throw err;
                        });
                    }
                }).catch((err)=>{
                    throw err;
                });

                return res.json(dataset);
            } else {
                throw `The fixed asset you are looking for was not found.`;
            }
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region updateTransaction
    updateTransaction: async(req, res) => {
        try {
            const { physical_fa_no_id, company_id } = req.body, { user } = req.session;

            const header = await wh100PhysicalFixedAssetHead.findOne({
                attributes: ['physical_fa_no'],
                where: {
                    uuid: physical_fa_no_id,
                    company_id
                },
                raw: true
            });

            const details = await wh101PhysicalFixedAssetDetail.findAll({
                attributes: [
                    'line_no','no','status_ok','status_ng','status_loss',
                    'request_sale','request_donation','request_write_off',
                    'remark','asset_location'],
                where: {
                    physical_fa_no_id,
                    company_id,
                    is_checked: true
                },
                order: [['line_no', 'asc']],
                raw: true
            }).catch((err)=>{
                throw err;
            });

            let BodyTxt = ``;

            if(details.length > 0) {
                for (let i = 0; i < details.length; i++) {
                    const status_ok = details[i]?.status_ok === 'Yes' ? true : false;
                    const status_ng = details[i]?.status_ng === 'Yes' ? true : false;
                    const status_loss = details[i]?.status_loss === 'Yes' ? true : false;

                    BodyTxt += `D:`; //เริ่มต้นบรรทัด
                    BodyTxt += `|${header?.physical_fa_no || null}`; //documentNo
                    BodyTxt += `|${details[i]?.line_no || 0}`; //lineNo
                    BodyTxt += `|${details[i]?.no || null}`; //faNo
                    BodyTxt += `|${status_ok}`; //statusOK
                    BodyTxt += `|${status_ng}`; //statusNG
                    BodyTxt += `|${status_loss}`; //statusLoss
                    BodyTxt += `|${details[i]?.request_sale}`; //requestSales
                    BodyTxt += `|${details[i]?.request_donation}`; //requsetDonation
                    BodyTxt += `|${details[i]?.request_write_off}`; //requestWriteOff
                    BodyTxt += `|${details[i]?.remark || null}`; //remark
                    BodyTxt += `|${details[i]?.asset_location || null}`; //assetLocation
                    BodyTxt += `|${user}`; //userHHCreate
                    BodyTxt += `|:E\n`; //สิ้นสุดบรรทัด
                }
            }

            await postPhysFixedAsset({
                company_id,
                body: { bodyTransaction: BodyTxt }
            }).catch((err)=>{
                throw err;
            });  
            
            const { arr } = await getPhysFixedAsset({ 
                physical_fa_no: header?.physical_fa_no, 
                company_id, 
                fetch_data: true 
            }).catch((err)=>{
                throw err;
            });   

            await wh100PhysicalFixedAssetHead.destroy({
                where: {
                    uuid: physical_fa_no_id,
                    company_id
                }
            }).catch((err)=>{
                throw err;
            });

            await wh101PhysicalFixedAssetDetail.destroy({
                where: {
                    physical_fa_no_id,
                    company_id
                }
            }).catch((err)=>{
                throw err;
            });

            if(arr.length > 0) {
                const headset = {}, detailset = [], uuid = uuidv4(`${physical_fa_no_id}${company_id}`);

                for (let i = 0; i < arr.length; i++) {
                    headset.physical_fa_no = arr[i]?.Physical_FA_No; //PK
                    headset.department = arr[i]?.Department;
                    headset.fa_location_code = arr[i]?.FA_Location_Code;
                    headset.total_check = arr[i]?.Total_Check,
                    headset.total_fa = arr[i]?.Total_FA,
                    headset.created_by = user;
                    headset.updated_by = user;
                    headset.company_id = company_id; //PK
                    headset.uuid = uuid; //PK

                    detailset.push({
                        physical_fa_no_id: uuid, //PK
                        line_no: arr[i]?.Line_No, //PK
                        no: arr[i]?.No, //PK
                        description: arr[i]?.Description,
                        department: arr[i]?.Department,
                        fa_location_code: arr[i]?.FA_Location_Code,
                        fa_check: arr[i]?.FA_Check,
                        book_value: arr[i]?.Book_Value,
                        status_ok: arr[i]?.Status_OK.trim(),
                        status_ng: arr[i]?.Status_NG.trim(),
                        status_loss: arr[i]?.Status_LOSS.trim(),
                        request_sale: arr[i]?.Request_Sale,
                        request_donation: arr[i]?.Request_Donation,
                        request_write_off: arr[i]?.Request_Write_Off,
                        remark: arr[i]?.Remark,
                        asset_location: arr[i]?.Asset_Location,
                        main_component: arr[i]?.Main_Component,
                        component_of: arr[i]?.Component_of,
                        acquisition_date: arr[i]?.Acquisition_Date,
                        acquisition_cost: arr[i]?.Acquisition_Cost,
                        is_checked: false,
                        created_by: user,
                        updated_by: user,
                        company_id: company_id //PK
                    });
                }

                if(detailset.length > 0) {
                    await wh100PhysicalFixedAssetHead.findOrCreate({
                        where: {
                            physical_fa_no: headset?.physical_fa_no,
                            company_id: headset?.company_id
                        },
                        defaults: headset
                    }).then( async ([ value, created ])=>{
                        if(created) {
                            await wh101PhysicalFixedAssetDetail.bulkCreate(detailset).catch((err)=>{
                                throw err;
                            });
                        }
                    }).catch((err)=>{
                        throw err;
                    });

                    console.log({ bodyTransaction: BodyTxt });
    
                    return res.status(200).json({ 
                        data: {...headset},
                        code: 200, 
                        status: 'success', 
                        message: 'The data has been successfully sent to the destination.'
                    });
                } else {
                    throw `The fixed asset you are looking for was not found.`;
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region checkReopen
    checkReopen: async(req, res) => {
        try {
            const { physical_fa_no, company } = req.params;

            const companys = await md101Companies.findOne({
                where: {
                    name: company
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            if(!companys) return res.status(404).json({ 
                data: {},
                count: 0,
                code: 404, 
                status: 'error', 
                message: 'Your company was not found in the system.'
            });

            const [data, count] = await Promise.all([
                await wh100PhysicalFixedAssetHead.findOne({
                    attributes: { exclude: ['company_id'] },
                    where: {
                        physical_fa_no,
                        company_id: companys?.uuid
                    },
                    raw: true
                }),
                await wh100PhysicalFixedAssetHead.count({
                    where: {
                        physical_fa_no,
                        company_id: companys?.uuid
                    },
                    raw: true
                })
            ])

            return res.json({ 
                data: {...data},
                count: count,
                code: 200, 
                status: 'success', 
                message: count > 0 ? `Data has been verified.` : `The document you want to delete is not found in this system.`,
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region deleteReopen
    deleteReopen: async(req, res) => {
        try {
            const { physical_fa_no_id, company } = req.params;

            const companys = await md101Companies.findOne({
                where: {
                    name: company
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            if(!companys) throw 'Your company was not found in the system.';

            const result =  await wh100PhysicalFixedAssetHead.findOne({
                attributes: ['physical_fa_no'],
                where: {
                    uuid: physical_fa_no_id,
                    company_id: companys?.uuid
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            if(!result) throw `The document you want to delete is not found in this system.`;

            await wh100PhysicalFixedAssetHead.destroy({
                where: {
                    uuid: physical_fa_no_id,
                    company_id: companys?.uuid
                }
            }).catch((err)=>{
                throw err;
            });

            await wh101PhysicalFixedAssetDetail.destroy({
                where: {
                    physical_fa_no_id,
                    company_id: companys?.uuid
                }
            }).catch((err)=>{
                throw err;
            });

            return res.json({ 
                code: 200, 
                status: 'success', 
                message: `The system has successfully deleted document number ${result?.physical_fa_no} from the system.`,
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region generate
    generate: async(req, res) => {
        try {
            const [companys, services] = await Promise.all([
                await md101Companies.findAll({
                    attributes: ['name','uuid'],
                    raw: true
                }),
                await md102WebServices.findOne({
                    where: {
                        api_name: `PhysFixedAsset`
                    },
                    raw: true
                })
            ]);

            if(companys.length > 0) {
                for (let i = 0; i < companys.length; i++) {
                    const credentials = {
                        username: config.NAV_USERNAME,
                        password: config.NAV_PASSWORD,
                        domain: config.NAV_DOMIAN
                    };
        
                    const configApi =  {
                        baseURL: encodeUrl(`${services.api_link}`, `${companys[i]?.name}`),
                        method: "get"
                    };

                    const client = NtlmClient(credentials, configApi);
                    const response = await client.get(`${configApi.baseURL}`).catch((err)=>{
                        throw err;
                    });

                    if(response.data) {
                        const result = response.data.value;

                        const physical_fa_no = result.map((item) => item.Physical_FA_No);

                        const unique = [...new Set(physical_fa_no)];

                        const headers = result.reduce(function (r, a) {
                            r[a.Physical_FA_No] = r[a.Physical_FA_No] || [];
                            r[a.Physical_FA_No].push(a);
                            
                            return r;
                        }, Object.create(null));

                        if(unique.length > 0) {
                            for (let j = 0; j < unique.length; j++) {
                                const rows = headers[unique[j]], dataset = {}, uuid = uuidv4(`${unique[j]}${companys[i]?.uuid}`);

                                const details = rows.map((item) => {
                                    dataset.physical_fa_no = item?.Physical_FA_No; //PK
                                    dataset.department = item?.Department;
                                    dataset.fa_location_code = item?.FA_Location_Code;
                                    dataset.total_check = item?.Total_Check,
                                    dataset.total_fa = item?.Total_FA,
                                    dataset.created_by = 'System';
                                    dataset.updated_by = 'System';
                                    dataset.company_id = companys[i]?.uuid;
                                    dataset.uuid = uuid;
                                      
                                    return {
                                        physical_fa_no_id: uuid, //PK
                                        line_no: item?.Line_No, //PK
                                        no: item?.No, //PK
                                        description: item?.Description,
                                        department: item?.Department,
                                        fa_location_code: item?.FA_Location_Code,
                                        fa_check: item?.FA_Check,
                                        book_value: item?.Book_Value,
                                        status_ok: item?.Status_OK.trim(),
                                        status_ng: item?.Status_NG.trim(),
                                        status_loss: item?.Status_LOSS.trim(),
                                        request_sale: item?.Request_Sale,
                                        request_donation: item?.Request_Donation,
                                        request_write_off: item?.Request_Write_Off,
                                        remark: item?.Remark,
                                        asset_location: item?.Asset_Location,
                                        main_component: item?.Main_Component,
                                        component_of: item?.Component_of,
                                        acquisition_date: item?.Acquisition_Date,
                                        acquisition_cost: item?.Acquisition_Cost,
                                        is_checked: false,
                                        created_by: 'System',
                                        updated_by: 'System',
                                        company_id: companys[i]?.uuid //PK
                                    }
                                });

                                if(details.length > 0) {
                                    await wh100PhysicalFixedAssetHead.findOrCreate({
                                        where: {
                                            physical_fa_no: dataset?.physical_fa_no,
                                            company_id: dataset?.company_id
                                        },
                                        defaults: dataset
                                    }).then( async ([ value, created ])=>{
                                        if(created) {
                                            await wh101PhysicalFixedAssetDetail.bulkCreate(details).catch((err)=>{
                                                throw err;
                                            });
                                        }
                                        
                                    }).catch((err)=>{
                                        throw err;
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return res.json([companys, services]);
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