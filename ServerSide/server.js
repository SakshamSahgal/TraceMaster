const express = require('express')   //importing express
const app = express()
const path = require('path')       
const useragent = require('express-useragent');
const fs = require('fs');
const axios = require('axios');

app.use(express.static(path.join(__dirname,"..","ClientSide","Static"))); //telling that my webapp will be using the files in the ClientSide/Static folder for static js files


app.set('view engine', 'ejs');      // set the view engine to ejs
app.use(useragent.express());       // use the useragent middleware to parse useragent header


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

app.get('/', (req, res) => {
    
    // Access user agent information from req.useragent
    const userAgentInfo = req.useragent;
    console.log(userAgentInfo);

    let template = {
        browserInfo: getBrowser(userAgentInfo.browser),
        osInfo: getOS(userAgentInfo.os), 
        ip : req.ip,
        deviceTypeInfo : getDeviceType(userAgentInfo),
    }
    getUserLocation(req.ip)
    
    res.render(path.join(__dirname,"..","ClientSide","index.ejs"),template)
})


//function to get the browser information Object
function getBrowser(browser) {
    
    let browserInfo = {
        name: browser
    }
    
    console.log(browser)
    
    if(fs.existsSync(path.join(__dirname,"..","ClientSide","Static","GUI","Browser",browser+".png")))
        browserInfo.logo = path.join("GUI","Browser",browser+".png")
    else
        browserInfo.logo = path.join("GUI","Browser","default.png")
    
        return browserInfo
}

function getOS(os) {
    
    let osInfo = {
        name: os
    }

    console.log(os)

    const linuxDistributions = [
        "linux", "ubuntu", "debian", "fedora", "red hat", "suse", "gentoo", "centos",
        "slackware", "arch", "mint", "kali", "elementary", "zorin", "manjaro",
        "deepin", "parrot", "backtrack", "backbox", "puppy", "raspbian", "raspberry"
      ];
      
      
    if(os.toLowerCase().includes("windows"))
        osInfo.logo = path.join("GUI","OS","windows.png")
    else if (linuxDistributions.some(dist => os.toLowerCase().includes(dist)))
        osInfo.logo = path.join("GUI", "OS", "Linux.png");
    else if(os.toLowerCase().includes("mac"))
        osInfo.logo = path.join("GUI","OS","Mac.png")
    else if(os.toLowerCase().includes("android"))
        osInfo.logo = path.join("GUI","OS","Android.png")
    else if(os.toLowerCase().includes("ios"))
        osInfo.logo = path.join("GUI","OS","IOS.png")
    else
        osInfo.logo = path.join("GUI","OS","Default.png")    
    
        return osInfo;
}

function getDeviceType(userAgentInfo) {

    DeviceTypeInfo = {
    }

    if (userAgentInfo.isMobile) {
        DeviceTypeInfo.name = "Mobile"
        DeviceTypeInfo.logo = path.join("GUI","DeviceType","Mobile.png")
    } else if (userAgentInfo.isTablet) {
        DeviceTypeInfo.name = "Tablet"
        DeviceTypeInfo.logo = path.join("GUI","DeviceType","Tablet.png")
    } else if (userAgentInfo.isDesktop) {
        DeviceTypeInfo.name = "Desktop"
        DeviceTypeInfo.logo = path.join("GUI","DeviceType","Desktop.png")
    } else {
        DeviceTypeInfo.name = "Unknown"
        DeviceTypeInfo.logo = path.join("GUI","DeviceType","Default.png")
    }

    return DeviceTypeInfo;
    
}

const getUserLocation = async (ip) => {
    try {
        const ipAddress = ip; //IPv6-mapped IPv4 address
        const ipv4Address = ipAddress.split(':').pop();
        const response = await axios.get(`https://ipinfo.io/${ipv4Address}/json`);
        const locationData = response.data;
        console.log(locationData);
    } catch (error) {
        console.error(error);
    }
};