 const rpcVersion = '1.0.9';

 /*======================================================*  
  *                                                      *
  *             # DBM Rich Presence - v1.0.9             *
  *             Created by Cap & General Wrex            *
  *  https://github.com/CapOliveiraBr/DBM-Rich-Presence  *
  *                                                      *
  *======================================================*/

const { Window, Menu, MenuItem, Shell } = nw;
const { writeFileSync } = require('fs');
const { resolve, join } = require('path');

let modal;
let menu;

let rpc;
let options;

const settings = require(resolve('rpcSettings.json'));
let enableRPC;
let enableCmdNames;

let currentProject;

function setMenu() {
  menu = Window.get().menu;

  const dbmRichPresenceMenu = new Menu();
  dbmRichPresenceMenu.append(new MenuItem({
    label: 'DBM Rich Presence',
    click: () => jQuery('#dbmRichPresence').modal('show')
  }))

  menu.append(new MenuItem({
    label: 'Integrations',
    submenu: dbmRichPresenceMenu
  }));
}

function setModal() {
  modal = document.createElement('div');
  modal.id = 'dbmRichPresence';
  modal.classList.add('ui');
  modal.classList.add('modal');
  modal.setAttribute('style', 'padding: 20px; height: 320px; border-radius: 10px; background-color: #36393e; border: 2px solid #000;');
  modal.innerHTML = `
    <h2>DBM Rich Presence - v${rpcVersion}</h2>
    Created by <b>Cap & General Wrex</b> - <a href="#" onclick="Shell.openExternal('https://github.com/CapOliveiraBr/DBM-Rich-Presence')">Repository</a>
    <h3>Settings</h3>
    Enable RPC:<br><br>
    <select id="enableRPC" class="round">
      <option value="true">True</option>
      <option value="false">False</option>
    </select><br><br>
    Show Command/Event Names:<br><br>
    <select id="enableCmdNames" class="round">
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
  `;

  document.body.appendChild(modal);
  document.getElementById('enableRPC').value = settings.enableRPC;
  document.getElementById('enableCmdNames').value = settings.enableCmdNames;

  setInterval(() => {
    enableRPC = document.getElementById('enableRPC').value === 'true' ? true : false;
    enableCmdNames = document.getElementById('enableCmdNames').value === 'true' ? true : false;

    writeFileSync(resolve('rpcSettings.json'), JSON.stringify({ enableRPC, enableCmdNames }));
    
    if (enableRPC) {
      if (!rpc) setRichPresence();
    } else stopRichPresence();
  }, 1000);
}

function setRichPresence() {
  if (!enableRPC) return;

  const { Client } = require('discord-rpc');
  rpc = new Client({ transport: 'ipc' });
  
  currentProject = require(resolve('settings.json'))['current-project'];
  const stateVal = `Project: ${currentProject.replace(/\\/g, '/').split('/').slice(-1).toString()}`;

  options = {
    state: stateVal,
    details: 'Editing Commands',
    largeImageKey: 'dbm',
    largeImageText: `DBM Rich Presence v${rpcVersion}`,
    startTimestamp: Date.now()
  };

  rpc.on('ready', () => {
    rpc.setActivity(options);
    setTimeout(() => rpc.setActivity(options), 1000);
  });

  rpc.login({ clientId: '675588061140353025' }).catch(() => alert('Some error ocurred on setting the Rich Presence!'));
}

function stopRichPresence() {
  if (!rpc) return;

  rpc.clearActivity().then(() => {
    rpc.destroy();
    rpc = null;
  });
}

function getName(type, index) { 
  return require(join(currentProject, 'data', `${type.toLowerCase()}.json`))[index].name;
}

function overrideFunctions() {
  const cache = {
    Commands: enableCmdNames ? `Command: ${getName('Commands', 1)} ` : 'Editing Commands', 
    Events: enableCmdNames ? `Event ${getName('Events', 1)} ` : 'Editing Events', 
    Settings: 'Editing Bot Settings'
  };
  
  let section = 'Commands';
  const shiftTabs = DBM.shiftTabs;
  DBM.shiftTabs = (event, sect, index) => { 
    try {
      section = sect; 
      options.details = cache[sect];
      rpc.setActivity(options);     
    } catch(err) {
      alert(err);
    }

    shiftTabs.apply(this, arguments);
  } 

  const onCommandClick = DBM.onCommandClick;
  DBM.onCommandClick = (index) => {  
    try {
      const details = enableCmdNames ? `${section.slice(0, -1)}: ${getName(section, index)}` : `Editing ${section}`; 
      cache['Commands'] = details;
      options.details = details;
      rpc.setActivity(options);
    } catch(err) {
      alert(err);
    }

    onCommandClick.apply(this, arguments);
  }

  const eonCommandClick = DBM.eonCommandClick;
  DBM.eonCommandClick = (index) => {  
    try {     
      const details = enableCmdNames ? `${section.slice(0, -1)}: ${getName(section, index)}` : `Editing ${section}`; 
      cache['Events'] = details;
      options.details = details;
      rpc.setActivity(options);
    } catch(err) {
      alert(err);
    }

    eonCommandClick.apply(this, arguments);
  }
}

setMenu();
setModal();

setRichPresence();
setTimeout(() => overrideFunctions(), 1000);
