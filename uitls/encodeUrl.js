const encodeUrl = (url, company) => {
    try {
        return url.replace(`#-company-#`, `'${encodeURI(company)}'`);
    } catch (error) {
        return null
    }
}

module.exports = encodeUrl;
