package com.bq.i1.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Created by WLLY on 2015/9/5..
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserLoginOutput {

    private String userName;
    private Integer type;
    private String userUuid;

    public UserLoginOutput() {
    }

    public UserLoginOutput(String userName, Integer type, String userUuid) {
        this.userName = userName;
        this.type = type;
        this.userUuid = userUuid;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public String getUserUuid() {
        return userUuid;
    }

    public void setUserUuid(String userUuid) {
        this.userUuid = userUuid;
    }
}
