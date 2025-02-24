const setLocalStoage = (params) => {
    localStorage.setItem("username", params?.username ?? null);
    localStorage.setItem("company", params?.company ?? null);
    localStorage.setItem("company_id", params?.company_id ?? null);
    localStorage.setItem("is_fixed_asset", params?.is_fixed_asset ?? null);
    localStorage.setItem("is_good_receipt", params?.is_good_receipt ?? null);
    localStorage.setItem("is_physical_fixed_asset", params?.is_physical_fixed_asset ?? null);
    localStorage.setItem("token", params?.token ?? null);

    if(params?.fixed_asset_no) localStorage.setItem("fixed_asset_no", params?.fixed_asset_no ?? null);
    if(params?.physical_fa_no) localStorage.setItem("physical_fa_no", params?.physical_fa_no ?? null);
    if(params?.physical_fa_no_id) localStorage.setItem("physical_fa_no_id", params?.physical_fa_no_id ?? null);
}

const getLocalStoage = () => {
    const username = localStorage.getItem("username");
    const company = localStorage.getItem("company");
    const company_id = localStorage.getItem("company_id");
    const is_fixed_asset = localStorage.getItem("is_fixed_asset");
    const is_good_receipt = localStorage.getItem("is_good_receipt");
    const is_physical_fixed_asset = localStorage.getItem("is_physical_fixed_asset");
    const token = localStorage.getItem("token");

    const fixed_asset_no = localStorage.getItem("fixed_asset_no");
    const physical_fa_no = localStorage.getItem("physical_fa_no");
    const physical_fa_no_id = localStorage.getItem("physical_fa_no_id");

    if(!token) alertMessage({ status: `error`, message: `Invalid token. Please log in again!`, backward: `/login` });

    $('#is_username').text(username);
    $('#is_company').text(`${company}`);

    return { username, company, company_id, is_fixed_asset, is_good_receipt, is_physical_fixed_asset, token, fixed_asset_no, physical_fa_no, physical_fa_no_id };
}

const removeLocalStoage = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("company");
    localStorage.removeItem("company_id");
    localStorage.removeItem("is_fixed_asset");
    localStorage.removeItem("is_good_receipt");
    localStorage.removeItem("is_physical_fixed_asset");
    localStorage.removeItem("token");
    localStorage.removeItem("fixed_asset_no");
    localStorage.removeItem("physical_fa_no");
    localStorage.removeItem("physical_fa_no_id");

    window.location.href=`/login`;
}

const refreshToken = async () => {
    // const { token } = getLocalStoage();

    // await axios.post('/login/refresh-token', {
    //     token
    // }).then(function (response) {
    //     setLocalStoage(response.data); 
    // }).catch(function (error) {
    //     alertMessage(error.response.data);
    // });
}