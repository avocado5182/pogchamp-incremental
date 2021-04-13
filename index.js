// #region Variables

    // #region UI Variables

    // Texts
        const pogchampsTxt = document.querySelector("#pogchamp-txt");

    // Buttons
        const getPogchampsBtn = document.querySelector("#pc-getbtn");

    // Upgrades
        const pcPassiveUpgDiv = document.querySelector("div.upgrades>.passives");
        
        // #endregion

    // #region Other Variables 

        // Gameplay
            tickSpeed = 10;

        // Currencies

            let pogGiveAmt = 1;
            let pogAmt = 0;
            
        // Clicking on the add pogchamps btn
            let canClick = true;
            let clickCooldown = 0;
        
        // Passive Pogchamps
            let pcPassiveUpgs = [];
            const pcPassiveUpgCount = 1;

            let pcPassiveCosts = [
                10
            ];

            const pcPassivePowers = [
                1
            ];

            let pcPassiveLevels = [];

            let pcPassiveBools = [
                false
            ];

            let pcPassiveStartedBools = [
                false
            ];
        
    // #endregion

// #endregion

// #region Window things

window.onload = () => {
    InitializeUpgBtns();
    
    LoadData();

    setInterval(() => {
        Tick();
    }, tickSpeed);

    console.log("Window loaded!");
}

window.onbeforeunload = () => {
    SaveData();
}

// #endregion

// #region Data Functions

function SaveData() {
    console.log("Saving data...");
    localStorage.setItem("data_currencies", JSON.stringify({
        pogamount: pogAmt,
        poggiveamount: pogGiveAmt,
    }));
    localStorage.setItem("data_passives", JSON.stringify({
        levels: pcPassiveLevels
    }));
    console.log("Data saved!");
}

function LoadData(debug=false) {
    console.log("Loading data...");
    let data = [];
    let currencies = JSON.parse(localStorage.getItem("data_currencies"));
    let passives = JSON.parse(localStorage.getItem("data_passives"));

    if (currencies == null || currencies == undefined) {
        currencies = {
            pogamount: pogAmt,
            poggiveamount: pogGiveAmt
        };
    }
    
    if (!passives) {
        passives = {
            levels: [0]
        };
    }

    pogAmt = currencies.pogamount;
    pogGiveAmt = currencies.poggiveamount;

    pcPassiveLevels = passives.levels;
    
    UpdateUI();
    
    console.log("Data loaded!");
}

// #endregion

function Tick() {
    // Handle passives
    for (let i = 0; i < pcPassiveStartedBools.length; i++) {
        if (pcPassiveStartedBools[i]) continue;
        pcPassiveStartedBools[i] = true;
        setInterval(() => {
            pogAmt += pcPassivePowers[i];
            UpdatePogchampsTxt();
        },1000 / pcPassiveLevels[i]);
    }
}

function Click() {
    if (canClick) {
        AddPogchamps(pogGiveAmt);
        canClick = false;
        setTimeout(() => {
            canClick = true;
        }, clickCooldown * 1000);
    }
}

function Upgrade(type,number) {
    let upgradeCost = GetUpgradeCost(0,0);
    if (upgradeCost != null || upgradeCost != undefined) {
        if (pogAmt >= upgradeCost) {
            // Can buy upgrade
            pogAmt -= upgradeCost;
            pcPassiveLevels[number]++;
            UpdateUI();
        }
    } else {
        console.trace(`Seems like upgrade (${type},${number}) failed with getting upgrade cost. :/`);
    }
}

function GetUpgradeCost(type, number) {
    if (type === 0) {
        // Passive upgrade
        return pcPassiveCosts[number];
    }
}

function AddPogchamps(amt) {
    pogAmt += amt;
    UpdatePogchampsTxt();
}

// #region UI Functions

function InitializeUpgBtns() {
    for (let i = 0; i < pcPassiveUpgCount; i++) {
        // <div class="upgrade">
        //     <p class="upgradelabel">+1 pogchamp/s</p>
        //     <input type="button" class="button" value="Cost: 10"></input>
        // </div>

        upgData = [
            pcPassivePowers[i],
            pcPassiveCosts[i],
            pcPassiveLevels[i]
        ];

        let upgradeDiv = document.createElement("div");
        let upgradeLabel = document.createElement("p");
        let upgBtn = document.createElement("input");

        upgradeDiv.classList.add("upgrade");

        upgBtn.type = "button";
        upgBtn.classList.add("button");
        upgBtn.value = `Cost: ${upgData[1]}`;

        upgradeLabel.innerHTML = `+${upgData[0]} pogchamp${(upgData[0] === 1) ? "" : "s"}/s (Lvl ${upgData[2]})`;
        upgradeLabel.id = `passiveupg0-${i}`;

        upgradeDiv.appendChild(upgradeLabel);
        upgradeDiv.appendChild(upgBtn);

        upgBtn.addEventListener("click", () => {
            Upgrade(0,i);
        });
        
        pcPassiveUpgs.push(upgradeDiv);
        pcPassiveUpgDiv.appendChild(upgradeDiv);
    }
}

function UpdateUI() {
    UpdatePogchampsTxt();
    UpdateUpgradeUI(0);
    UpdateText(getPogchampsBtn, `Get ${pogGiveAmt} pogchamp${(pogGiveAmt === 1) ? "" : "s"}`);
}

function UpdateUpgradeUI(type) {
    if (type === 0) {
        for (let i = 0; i < pcPassiveLevels.length; i++) {
            let upgradeLabel = document.querySelector(`#passiveupg0-${i}`);
            // upgradeLabel.innerHTML = `+${upgData[0]} pogchamp${(upgData[0] === 1) ? "" : "s"}/s (Lvl ${upgData[2]})`;
            UpdateText(
                upgradeLabel,
                `+${pcPassivePowers[0]} pogchamp${(pcPassivePowers[0] === 1) ? "" : "s"}/s (Lvl ${pcPassiveLevels[i]})`
            );
        }
    }
}

function UpdatePogchampsTxt(amt=pogAmt) {
    UpdateText(pogchampsTxt, `${amt} pogchamps`);
}

function UpdateText(text, value) {
    text.innerHTML = value;
}

// #endregion

// #region Event Listeners

getPogchampsBtn.addEventListener("click", () => {
    Click();
});

// #endregion

