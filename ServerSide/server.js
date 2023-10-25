const express = require('express')   //importing express
const app = express()
const path = require('path')       
const useragent = require('express-useragent');
const fs = require('fs');
const axios = require('axios');

app.use(express.static(path.join(__dirname,"..","ClientSide","Static")));   //telling that my webapp will be using the files in the ClientSide/Static folder for static js files
app.use(useragent.express());                                               // use the useragent middleware to parse useragent header


app.set('trust proxy', true);       // Enable "trust proxy" to get the client's IP address through proxy headers [setting this makes the load balancer to forward the client's IP address in the X-Forwarded-For header instead of loopback address]
app.set('view engine', 'ejs');      // set the view engine to ejs


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

app.get('/', async (req, res) => {
    
    // Access user agent information from req.useragent
    const userAgentInfo = req.useragent;
    console.log(userAgentInfo);

    let template = {
        browserInfo: getBrowser(userAgentInfo.browser),
        osInfo: getOS(userAgentInfo.os), 
        ip : req.ip,
        deviceTypeInfo : getDeviceType(userAgentInfo),
        locationData : await getUserLocation(req.ip)
    }
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
    
    return browserInfo;
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
        osInfo.logo = path.join("GUI","OS","Windows.png")
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
    
    const ipAddress = ip; //IPv6-mapped IPv4 address
    const ipv4Address = ipAddress.split(':').pop();
    console.log(ipAddress + " " + ipv4Address);
 
    try {
        const response = await axios.get(`https://ipinfo.io/${ipv4Address}/json`);
        const locationData = response.data;
        console.log(locationData)
        return locationData;
        
    } catch (error) {
        // console.error(error);
        console.log("req failed")
        return null;
    }
};