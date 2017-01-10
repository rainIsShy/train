package com.bq.i1.auth;

import com.bq.i1.web.AdapterInfoController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.tomcat.util.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.WebUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by WLLY on 2016/10/5.
 */

@Controller
public class AuthController {
    private Logger logger = LoggerFactory.getLogger(AuthController.class);
    private ObjectMapper objectMapper = new ObjectMapper();

    @Value(value = "${i1.i1-server.url}")
    private String serverUrl;

    @Autowired
    private AdapterInfoController adapterInfoController;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String home(HttpServletRequest request, HttpServletResponse response,
                       @RequestParam(value = "auto_login", required = false) Boolean isAutoLogin,
                       @RequestParam(value = "user_no", required = false) String userNo,
                       @RequestParam(value = "user_type", required = false) String userType) throws Exception {

        int port = request.getServerPort();

        //html embedded in app
        if (isAutoLogin != null && isAutoLogin == true) {
            logger.info("New Login. URL: {}, parameters: {} {} {}", request.getRequestURI(), isAutoLogin, userNo, userType);

            //Check if already set the cookie
            Cookie globalCookie = WebUtils.getCookie(request, "globals" + port);
            if (globalCookie != null) {
                return "forward:/index-app.html";
            }

            //Parameters validation
            if (StringUtils.isEmpty(userNo)) {
                throw new Exception("User no must exist when running in app.");
            }
            if (StringUtils.isEmpty(userType)) {
                throw new Exception("User type must exist when running in app.");
            }

            String authHeader = request.getHeader("Authorization");
            if (StringUtils.isEmpty(authHeader) || !authHeader.startsWith("Basic ")) {
                throw new Exception("Authorization must exist and legal in request header. ");
            }

            //Authorization:Basic YWRtaW46MTIz
            //The base64 part starts from index six.
            String authBase64Header = authHeader.substring(6);
            if (!Base64.isBase64(authBase64Header)) {
                throw new Exception("Authorization is not a legal base64 string. ");
            }

            String decodeAuthHeader = new String(Base64.decodeBase64(authBase64Header));
            String[] decodeAuthHeaderArray = decodeAuthHeader.split(":");
            if (decodeAuthHeaderArray == null || decodeAuthHeaderArray.length != 2) {
                throw new Exception("Unknown base64 authentication string.");
            }

            if (!decodeAuthHeaderArray[0].equals(userNo)) {
                throw new Exception("User name in url and authentication should be equal.");
            }

            UserLoginOutput loginOutput = loginToServer(decodeAuthHeaderArray[0], decodeAuthHeaderArray[1]);

            //add cookie
            Map<String, Object> currentUser = new HashMap<>();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", userNo);
            userInfo.put("authdata", authBase64Header);
            userInfo.put("userUuid", loginOutput.getUserUuid());
            currentUser.put("currentUser", userInfo);

            String displayName = String.format("\"%s\"", loginOutput.getUserName());

            response.addCookie(new Cookie("globals" + port, URLEncoder.encode(objectMapper.writeValueAsString(currentUser), "UTF-8")));
            response.addCookie(new Cookie("displayName" + port, URLEncoder.encode(displayName, "UTF-8")));
            response.addCookie(new Cookie("displayType" + port, String.valueOf(loginOutput.getType())));
            response.addCookie(new Cookie("autoLogin" + port, "1"));

            String urlJsonString = objectMapper.writeValueAsString(adapterInfoController.getAdapterInfo());
            response.addCookie(new Cookie("urls" + port, Base64.encodeBase64String(urlJsonString.getBytes())));

            return "forward:/index-app.html";
        } else {
            return "forward:/index.html";
        }
    }

    /**
     * Login to server to check username and password.
     *
     * @param userName
     * @param password
     * @return
     * @throws Exception
     */
    private UserLoginOutput loginToServer(String userName, String password) throws Exception {
        DefaultHttpClient httpClient = new DefaultHttpClient();
        HttpPost postRequest = new HttpPost(serverUrl + "/auth/login");

        StringEntity input = new StringEntity(String.format("{\"userName\":\"%s\",\"password\":\"%s\"}", userName, password));
        input.setContentType("application/json");
        postRequest.setEntity(input);

        HttpResponse response = httpClient.execute(postRequest);

        if (response.getStatusLine().getStatusCode() != 200) {
            throw new RuntimeException("Failed : HTTP error code : " + response.getStatusLine().getStatusCode());
        }

        BufferedReader br = new BufferedReader(new InputStreamReader((response.getEntity().getContent())));

        StringBuilder sb = new StringBuilder();
        String output;
        while ((output = br.readLine()) != null) {
            sb.append(output);
        }

        httpClient.getConnectionManager().shutdown();

        return objectMapper.readValue(sb.toString(), UserLoginOutput.class);
    }
}
