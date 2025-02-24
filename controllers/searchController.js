const { Op } = require("sequelize");
const { wh100PhysicalFixedAssetHead, wh101PhysicalFixedAssetDetail } = require('../models/index');

const filters = (filter, constraint) => {
    let filterLike = { ...filter };

    for (const key in filterLike) {
        if (filterLike[key] instanceof Date) {
            filterLike[key] = {
                [Op.eq]: filterLike[key],
            };
        } else {
            filterLike[key] = {
                [Op.like]: `%${filterLike[key]}%`,
            };
        }
    }

    if (constraint) {
        filterLike = { ...filterLike, ...constraint };
    }

    return filterLike;
}

module.exports = {
    index: async(req, res) => {
        try {
            let title = `Search`, filter = {};
            const { module } = req.params, { company_id } = req.session, { document_no } = req.query, arr = [];
 
            switch(module) {
                case 'good-receipt-notes': 

                break;

                case 'physical-fixed-asset': 
                    if(document_no) filter = { physical_fa_no: document_no };

                    const headerA = await wh100PhysicalFixedAssetHead.findAll({
                        attributes: ['physical_fa_no','updated_by','uuid','company_id'],
                        where: filters(filter, { company_id }),
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });

                    if(headerA.length > 0) {
                        for (let i = 0; i < headerA.length; i++) {
                            arr.push({
                                document_no: headerA[i]?.physical_fa_no,
                                last_action: headerA[i]?.updated_by,
                                uuid: headerA[i]?.uuid,
                                link: `/physical-fixed-asset/list/${headerA[i]?.uuid}/${headerA[i]?.company_id}`
                            });
                        }
                    }

                    title = `Search - Physical Fixed Asset`
                break;
            }

            return res.render('search', { 
                title: title,
                result: arr,
                module,
                query: req.query
            });
        } catch (err) {
            console.error(err);
        }
    },
}