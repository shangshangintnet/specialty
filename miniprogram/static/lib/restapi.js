//用户数据示例
let users = [
];

//群数据示例
let groups = [
];


function RestApi() {

}

RestApi.prototype.findFriends = function (user) {
    var friendList = users.filter(v => v.uuid != user.uuid);
    return friendList;
};

RestApi.prototype.findGroups = function (user) {
    var groupList = groups.filter(v => v.userList.find(id => id == user.uuid));
    return groupList;
};

RestApi.prototype.findUser = function (username, password) {
    var user = users.find(user => (user.name == username && user.password == password))
    return user;
};

RestApi.prototype.findGroupById = function (groupId) {
    var group = groups.find(group => (group.uuid == groupId));
    return group;
};


RestApi.prototype.findUserById = function (userId) {
    var user = users.find(user => (user.uuid == userId))
    return user;
};


RestApi.prototype.findGroupMembers = function (groupId) {
    let members = [];
    let group = groups.find(v => v.uuid == groupId);
    users.map(user => {
        if (group.userList.find(v => v == user.uuid)) {
            members.push(user)
        }
    });
    return members;
};

export default new RestApi();