const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require("../config/database");

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: {
        type: DataTypes.ENUM('admin', 'exam_taker', 'superadmin'),
        defaultValue: 'exam_taker'
    },
    permissions: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    userDetails: {
        type: DataTypes.JSONB,
        defaultValue: {}
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        defaultValue: 'active'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => { user.password = await bcrypt.hash(user.password, 10); },
        beforeUpdate: async (user) => {
            if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
        }
    }
});

User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

module.exports = User;
