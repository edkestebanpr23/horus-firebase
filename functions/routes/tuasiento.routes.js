'use strict';
const { Router } = require('express');
const router = Router();
const admin = require("firebase-admin");
const axios = require('axios').default;
require('dotenv').config()

const fs = require('fs');
const FileAPI = require('file-api')
const File = FileAPI.File;
const atob = require('atob');
const FormData = require('form-data');
const data = new FormData();

const db = admin.firestore();



const base64ToIMG = async (data, name) => {
    var canvas = document.createElement('canvas');
    var img_b64 = canvas.toDataURL('image/png');
    var png = img_b64.split(',')[1];

    var the_file = new Blob([window.atob(png)], { type: 'image/png', encoding: 'utf-8' });

    var fr = new FileReader();
    fr.onload = function (oFREvent) {
        var v = oFREvent.target.result.split(',')[1]; // encoding is messed up here, so we fix it
        v = atob(v);
        var good_b64 = btoa(decodeURIComponent(escape(v)));
        document.getElementById("uploadPreview").src = "data:image/png;base64," + data;
    };
    fr.readAsDataURL(the_file);
    return fr;
    // let buff = new Buffer.from(data, 'base64');
    // fs.writeFileSync(name, buff);
    // console.log(name + " Calculada");
    // return buff;
};

const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

router.get('/api/images', (req, res) => {
    try {
        var sanitary = req.body.sanitary;
        // let buff = new Buffer.from(sanitary, 'base64');
        // let f = fs.writeFileSync('sanitary-out2.png', buff);
        // generate file from base64 string
        // var file = base64ToIMG("data:image/png;base64," + sanitary, 'sanitary3.png')
        const file = dataURLtoFile('data:image/png;base64,' + sanitary, 'sanitarioIMG');
        return res.status(200).send(file);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
});


router.get('/api/predict', async (req, res) => {
    try {


        // try {
        //     let sanitary = base64ToIMG(req.body.sanitary, 'sanitary.png');
        //     // let geometry = new Buffer.from(await base64ToIMG(req.body.geometry, 'geometry.png', 'png'));
        // } catch (error) {
        //     console.log('No se pueden converitr', error);
        //     return res.status(204).json({
        //         message: 'Error trying to convert',
        //         error
        //     });
        // }

        // var sanitaryBuff = new Buffer.from(req.body.sanitary, 'base64');
        // var geometryBuff = new Buffer.from(req.body.sanitary, 'base64');
        // fs.writeFileSync('sanitary.png', sanitaryBuff);
        // fs.writeFileSync('geometry.png', geometryBuff);
        // let sanitary = base64ToIMG(req.body.sanitary, 'sanitary.png');
        // let geometry = base64ToIMG(req.body.geometry, 'geometry.png');

        let headers = {
            'Content-Type': 'application/json',
        }

        let response;

        axios.post('https://horus.corona.com.co:2022/api/login/authenticate', {
            'Username': process.env.USER,
            'Password': process.env.PASSWORD
        }, { headers }).then((response) => {
            headers['Authorization'] = 'Bearer ' + response.data;
            console.log('Token:', response.data);

            axios.post('https://horus.corona.com.co:2022/api/prediction/predictSKU', {
                sanitary: new Buffer.from(req.body.sanitary, 'base64'),
                geometry: new Buffer.from(req.body.geometry, 'base64')
            }, {
                headers
            }).then((responseData) => {
                console.log('predicción', responseData.response);
                return res.status(200).json({
                    data: responseData
                });
            }).catch((error) => {
                console.log('------------------------------ Sin predicción');
                console.log(error);
                return res.status(500).send(error);
            })

        }).catch((error) => {
            return res.status(204).json({
                message: 'Error trying to login',
                error
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error initial',
            error
        });
    }
});


router.get('/api/authorization', (req, res) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
        }

        axios.post('https://horus.corona.com.co:2022/api/login/authenticate', {
            'Username': process.env.USER,
            'Password': process.env.PASSWORD
        }, {
            headers: headers
        })
            .then((response) => {
                console.log(response.data);
                return res.status(200).json({
                    'token': response.data
                });
            })
            .catch((error) => {
                console.log(error)
                return res.status(204).json();
            });
    } catch (error) {
        console.log('Hay un error', error);
        return res.status(500).send(error);
    }
});

router.get('/api/getProducts', (req, res) => {
    try {

        let headers = {
            'Content-Type': 'application/json',
        }

        axios.post('https://horus.corona.com.co:2022/api/login/authenticate', {
            'Username': process.env.USER,
            'Password': process.env.PASSWORD
        }, { headers }).then((response) => {
            headers['Authorization'] = 'Bearer ' + response.data;
            axios.post('https://horus.corona.com.co:2022/api/products/getProducts', {}, {
                headers
            }).then((responseData) => {
                console.log(responseData.data);
                return res.status(200).json({
                    data: responseData.data.Result
                });
            }).catch((error) => {
                return res.status(204).json({
                    message: 'Error trying to getProducts',
                    error
                });
            })
        }).catch((error) => {
            return res.status(204).json({
                message: 'Error trying to login',
                error
            });
        });
    } catch (error) {
        return res.status(500).send(error);
    }
});

module.exports = router;