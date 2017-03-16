package com.bq.i1.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by xavier on 2016/9/4.
 */
@RestController
@RequestMapping("/adapter")
public class AdapterInfoController {

    private String adapterServerUrl;
    private String ecAdapterServerUrl;
    private String tmallAdapterServerUrl;
    private String tiptopAdapterServerUrl;

    private String i1ServerUrl;


    @Value(value = "${i1.i1-adapter.url}")
    public void setAdapterServerUrl(String adapterServerUrl) {
        this.adapterServerUrl = adapterServerUrl;
    }

    @Value(value = "${i1.ec-adapter.url}")
    public void setEcAdapterServerUrl(String ecAdapterServerUrl) {
        this.ecAdapterServerUrl = ecAdapterServerUrl;
    }

    @Value(value = "${i1.tmall-adapter.url}")
    public void setTmallAdapterServerUrl(String tmallAdapterServerUrl) {
        this.tmallAdapterServerUrl = tmallAdapterServerUrl;
    }

    @Value(value = "${i1.tiptop-adapter.url}")
    public void setTiptopAdapterServerUrl(String tiptopAdapterServerUrl) {
        this.tiptopAdapterServerUrl = tiptopAdapterServerUrl;
    }

    @Value(value = "${i1.i1-server.url}")
    public void setI1ServerUrl(String i1ServerUrl) {
        this.i1ServerUrl = i1ServerUrl;
    }

    @RequestMapping(value = "/info", method = RequestMethod.GET)
    public AdapterInfo getAdapterInfo() {
        AdapterInfo adapterInfo = new AdapterInfo();
        adapterInfo.setAdapterServerUrl(this.adapterServerUrl);
//        adapterInfo.setEcAdapterServerUrl(this.ecAdapterServerUrl);
        adapterInfo.setEcAdapterServerUrl("http://project.benchmarkchina.com:10041");

        adapterInfo.setI1ServerUrl(this.i1ServerUrl);
        adapterInfo.setTiptopAdapterServerUrl(this.tiptopAdapterServerUrl);
        adapterInfo.setTmallServerUrl(this.tmallAdapterServerUrl);
        return adapterInfo;
    }

    public static class AdapterInfo {
        private String adapterServerUrl;
        private String ecAdapterServerUrl;
        private String tiptopAdapterServerUrl;
        private String i1ServerUrl;
        private String tmallServerUrl;

        public String getTmallServerUrl() {
            return tmallServerUrl;
        }

        public void setTmallServerUrl(String tmallServerUrl) {
            this.tmallServerUrl = tmallServerUrl;
        }

        public String getAdapterServerUrl() {
            return adapterServerUrl;
        }

        public void setAdapterServerUrl(String adapterServerUrl) {
            this.adapterServerUrl = adapterServerUrl;
        }

        public String getEcAdapterServerUrl() {
            return ecAdapterServerUrl;
        }

        public void setEcAdapterServerUrl(String ecAdapterServerUrl) {
            this.ecAdapterServerUrl = ecAdapterServerUrl;
        }

        public String getTiptopAdapterServerUrl() {
            return tiptopAdapterServerUrl;
        }

        public void setTiptopAdapterServerUrl(String tiptopAdapterServerUrl) {
            this.tiptopAdapterServerUrl = tiptopAdapterServerUrl;
        }

        public String getI1ServerUrl() {
            return i1ServerUrl;
        }

        public void setI1ServerUrl(String i1ServerUrl) {
            this.i1ServerUrl = i1ServerUrl;
        }
    }
}