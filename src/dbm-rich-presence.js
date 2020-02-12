const rpcVersion = '1.1.0';

/*======================================================*  
 *                                                      *
 *             # DBM Rich Presence - v1.1.0             *
 *             Created by Cap & General Wrex            *
 *  https://github.com/CapOliveiraBr/DBM-Rich-Presence  *
 *                                                      *
 *======================================================*/

const { Window, Menu, MenuItem } = nw;
const { writeFileSync } = require('fs');
const { resolve } = require('path');

let modal;
let menu;

let rpc;
let rpcOptions = {
  details: 'Not Working',
  state: 'No Project Opened',
  largeImageKey: 'dbm',
  largeImageText: `DBM Rich Presence v${rpcVersion}`,
  startTimestamp: Date.now()
};

const rpcSettings = require(resolve('rpcSettings.json'));
let enableRPC;
let enableCmdNames;

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
   Created by <b>Cap & General Wrex</b> - <a href="#" onclick="nw.Shell.openExternal('https://github.com/CapOliveiraBr/DBM-Rich-Presence')">Repository</a>
   <h3>Settings</h3>
   Enable RPC:<br><br>
   <select id="enableRPC" class="round">
     <option value="true">True</option>
     <option value="false">False</option>
   </select><br><br>
   Show Command/Event Names:<br><br>
   <select id="enableCmdNames" class="round">
     <option value="true" >True</option>
     <option value="false">False</option>
   </select>
 `;

  document.body.appendChild(modal);

  document.getElementById('enableRPC').value = rpcSettings.enableRPC;
  document.getElementById('enableCmdNames').value = rpcSettings.enableCmdNames;

  setInterval(() => {
    enableRPC = document.getElementById('enableRPC').value === 'true' ? true : false;
    enableCmdNames = document.getElementById('enableCmdNames').value === 'true' ? true : false;

    writeFileSync(resolve('rpcSettings.json'), JSON.stringify({
      enableRPC,
      enableCmdNames
    }));

    if (enableRPC) {
      if (!rpc) setRichPresence();
    } else stopRichPresence();
  }, 1000);
}

function setRichPresence() {
  if (!enableRPC) return;

  const { Client } = require('discord-rpc');
  rpc = new Client({ transport: 'ipc' });

  rpcOptions.state = `Project: ${DBM._currentProject.replace(/\\/g, '/').split('/').slice(-1).toString()}`;

  rpc.on('ready', () => {
    try {
      overrideFunctions();
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }
  });

  rpc.login({ clientId: '675588061140353025' }).catch(alert);
}

function stopRichPresence() {
  if (!rpc) return;

  rpc.clearActivity().then(() => {
    rpc.destroy();
    rpc = null;
  });
}

function getName(type, index) {
  switch (type) {
    case 'Commands':
      return DBM.$cmds[index] && DBM.$cmds[index].name ? DBM.$cmds[index].name : false;
    case 'Events':
      return DBM.$evts[index] && DBM.$evts[index].name ? DBM.$evts[index].name : false;
  }
}

function overrideFunctions() {
  const cache = {
    Commands: enableCmdNames ? `Command: ${getName('Commands', 1) || `None`}` : `Editing Commands`,
    Events: enableCmdNames ? `Event: ${getName('Events', 1) || `None`}` : `Editing Events`,
    Settings: 'Editing Bot Settings'
  };

  let section = 'Commands';

  const shiftTabs = DBM.shiftTabs;
  DBM.shiftTabs = function(event, sect, index) {
    try {
      section = sect;
      rpcOptions.details = cache[sect];
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    shiftTabs.apply(this, arguments);
  }

  const onCommandClick = DBM.onCommandClick;
  DBM.onCommandClick = function(index) {
    try {
      const type = section.slice(0, -1);
      const details = enableCmdNames ? `${index ? `${type}: ` : ' '}${index ? (getName(section, index) || `New ${type}`) : 'Not Working'}` : `Editing ${section}`;

      cache['Commands'] = details;
      rpcOptions.details = details;
      rpcOptions.state = `Project: ${DBM._currentProject.replace(/\\/g, '/').split('/').slice(-1).toString()}`;
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    onCommandClick.apply(this, arguments);
  }

  const eonCommandClick = DBM.eonCommandClick;
  DBM.eonCommandClick = function(index) {
    try {
      const type = section.slice(0, -1);
      const details = enableCmdNames ? `${index ? `${type}: ` : ' '}${index ? (getName(section, index) || `New ${type}`) : 'Not Working'}` : `Editing ${section}`;

      cache['Events'] = details;
      rpcOptions.details = details;
      rpcOptions.state = `Project: ${DBM._currentProject.replace(/\\/g, '/').split('/').slice(-1).toString()}`;

      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    eonCommandClick.apply(this, arguments);
  }

  const createNewProject = DBM.createNewProject;
  DBM.createNewProject = function() {
    try {
      rpcOptions.state = `Creating Project...`;
      rpcOptions.startTimestamp = Date.now()
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    createNewProject.apply(this, arguments);
  }

  const openProject = DBM.openProject;
  DBM.openProject = function() {
    try {
      rpcOptions.state = 'Opening Project...';
      rpcOptions.startTimestamp = Date.now()
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    openProject.apply(this, arguments);
  }

  const saveAndClose = DBM.saveAndClose;
  DBM.saveAndClose = function() {
    try {
      rpcOptions.state = `No Project Opened`;
      rpc.setActivity(rpcOptions);
    } catch (err) {
      alert(err);
    }

    saveAndClose.apply(this, arguments);
  }
}

setMenu();
setModal();

setRichPresence();
