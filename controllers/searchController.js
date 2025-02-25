const { Op } = require("sequelize");
const { wh100PhysicalFixedAssetHead, wh200GoodReceiptNotesHead } = require('../models/index');

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
            let title = `Search`, filter = {}, link = ``, details = ``;
            const { module } = req.params, { company_id } = req.session, { document_no } = req.query;
 
            switch(module) {
                case 'good-receipt-notes': 
                    if(document_no) filter = { document_no: document_no };

                    const arrA = await wh200GoodReceiptNotesHead.findAll({
                        attributes: ['document_no','updated_by','uuid','company_id'],
                        where: filters(filter, { company_id }),
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });

                    if(arrA.length > 0) {
                        for (let i = 0; i < arrA.length; i++) {
                            details += `
                                <button type="button" class="btn bg-body-tertiary btn-lg btn-customize d-flex align-items-center rounded-4 shadow" onclick="window.location.href='/good-receipt-notes/list/${arrA[i]?.uuid}/${arrA[i]?.company_id}'">
                                    <span class="col-2 bg-primary-subtle me-2 d-flex rounded-5 align-items-center justify-content-center cus">
                                        <i class="fa-solid fa-file-lines text-primary"></i>
                                    </span>
                                    <small class="col-6 fw-semibold fs-5">
                                        ${arrA[i]?.document_no}
                                    </small>
                                    <small class="col-4 fs-6 text-break">
                                        <i class="fa-solid fa-user-tag me-1"></i>${arrA[i]?.updated_by}
                                    </small>
                                </button>
                            `;
                        }
                    }

                    title = `Search - Good Receipt Notes`;
                    link = `/good-receipt-notes`;
                break;

                case 'physical-fixed-asset': 
                    if(document_no) filter = { physical_fa_no: document_no };

                    const arrB = await wh100PhysicalFixedAssetHead.findAll({
                        attributes: ['physical_fa_no','updated_by','uuid','company_id'],
                        where: filters(filter, { company_id }),
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });

                    if(arrB.length > 0) {
                        for (let i = 0; i < arrB.length; i++) {
                            details += `
                                <button type="button" class="btn bg-body-tertiary btn-lg btn-customize d-flex align-items-center rounded-4 shadow" onclick="window.location.href='/physical-fixed-asset/list/${arrB[i]?.uuid}/${arrB[i]?.company_id}'">
                                    <span class="col-2 bg-primary-subtle me-2 d-flex rounded-5 align-items-center justify-content-center cus">
                                        <i class="fa-solid fa-file-lines text-primary"></i>
                                    </span>
                                    <small class="col-6 fw-semibold fs-5">
                                        ${arrB[i]?.physical_fa_no}
                                    </small>
                                    <small class="col-4 fs-6 text-break">
                                        <i class="fa-solid fa-user-tag me-1"></i>${arrB[i]?.updated_by}
                                    </small>
                                </button>
                            `;
                        }
                    }

                    title = `Search - Physical Fixed Asset`;
                    link = `/physical-fixed-asset`;
                break;
            }

            return res.render('search', { 
                title: title,
                module,
                query: req.query,
                link,
                details
            });
        } catch (err) {
            console.error(err);
        }
    },
}