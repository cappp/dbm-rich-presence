 /*======================================================*  
  *                                                      *
  *             # DBM Rich Presence - v1.0.0             *
  *                   Created by Cap                     *
  *  https://github.com/CapOliveiraBr/DBM-Rich-Presence  *
  *                                                      *
  *======================================================*/

const { writeFileSync } = require('fs');
const { resolve } = require('path');

let modal;
let Menu;
let rpc;

const settings = require(resolve('rpcSettings.json'));
let enableRPC;

function setMenu() {
  Menu = nw.Window.get().menu;

  const dbmRichPresenceMenu = new nw.Menu();
  dbmRichPresenceMenu.append(new nw.MenuItem({
    label: 'DBM Rich Presence',
    click: () => jQuery('#discordRichPresence').modal('show')
  }))

  Menu.append(new nw.MenuItem({
    label: 'Integrations',
    submenu: dbmRichPresenceMenu
  }));
}

function setModal() {
  modal = document.createElement('div');
  modal.id = 'discordRichPresence';
  modal.classList.add('ui');
  modal.classList.add('modal');
  modal.setAttribute('style', 'padding: 20px; height: 220px; border-radius: 10px; background-color: #36393e; border: 2px solid #000;');
  modal.innerHTML = `
    <h2>DBM Rich Presence - v1.0.0</h2>
    Created by <b>Cap</b> - <a href="#" onclick="nw.Shell.openExternal('https://github.com/CapOliveiraBr/DBM-Rich-Presence')">Repository</a>
    <h3>Settings</h3>
    Enable RPC:<br><br>
    <select id="enableRPC" class="round">
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
  `;

  document.body.appendChild(modal);
  document.getElementById('enableRPC').value = settings.enableRPC;

  setInterval(() => {
    enableRPC = document.getElementById('enableRPC').value === 'true' ? true : false;

    writeFileSync(resolve('rpcSettings.json'), JSON.stringify({ enableRPC }));
    
    if (enableRPC) {
      if (!rpc) setRichPresence();
    } else stopRichPresence();
  }, 1000);
}

function setRichPresence() {
  if (!enableRPC) return;

  const { Client } = require('discord-rpc');
  rpc = new Client({ transport: 'ipc' });
  
  const stateVal = `Project: ${require(resolve('settings.json'))['current-project'].replace(/\\/g, '/').split('/').slice(-1).toString()}`;

  function setActivity() {
    rpc.setActivity({
      state: stateVal,
      largeImageKey: 'dbm',
      largeImageText: 'DBM Rich Presence v1.0.0',
      startTimestamp: Date.now()
    });
  }

  rpc.on('ready', () => {
    setActivity();
    setTimeout(() => setActivity(), 1000);
  });

  rpc.login({ clientId: '675588061140353025' }).catch(() => alert('Some error ocurred on set your RPC.'));
}

function stopRichPresence() {
  if (!rpc) return;

  rpc.clearActivity().then(() => {
    rpc.destroy();
    rpc = null;
  });
}

setMenu();
setModal();
setRichPresence();
