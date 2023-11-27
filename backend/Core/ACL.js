// main acl
const Permission = {
    visitor: {
        Read: true,
        ReadOther: true,
        lv:0,
    }
}

// access permission config
Permission.user = {
    ...Permission.visitor,
    Read: true,
    Write: true,
    Update: true,
    Delete: true,
    lv:1,
};
Permission.staff = {
    ...Permission.user,
    ReadAll: true,
    lv:2,
}
Permission.admin = {
    ...Permission.staff,
    WriteAll: true,
    UpdateAll: true,
    DeleteAll: true,
    lv:3,
};
Permission.sadmin = {
    ...Permission.admin,
    RealDelete: true,
    lv:4,
};

module.exports = {Permission}
