exports.module = {
    "authenticationMode": "MasterUser",
    "authorityUri": "https://login.microsoftonline.com/common/v2.0",
    "scope": "https://analysis.windows.net/powerbi/api",
    "apiUrl": "https://api.powerbi.com/",
    "clientId": process.env.CLIENTID,
    "workspaceId": process.env.WORKSPACEID,
    "reportId": process.env.REPORTID,
    "pbiUsername": process.env.ID,
    "pbiPassword": process.env.PASSWORD,
    "clientSecret": "",
    "tenantId": ""
} 