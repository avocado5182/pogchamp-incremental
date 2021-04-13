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
            const pcPassiveUpgCount = 2;

            let pcPassiveBaseCosts = [
                10,
                100
            ];

            let pcPassiveMults = [
                1+1/3,
                1+1/4
            ]

            const pcPassivePowers = [
                1,
                10
            ];

            let pcPassiveLevels = [];

            let pcPassiveBools = [
                false,
                false
            ];

            let pcPassiveStartedBools = [
                false,
                false
            ];

            let pcPassiveIntervals = [];
        
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
        levels: pcPassiveLevels,
        starteds: pcPassiveStartedBools,
        intervals: pcPassiveIntervals
    }));
    console.log("Data saved!");
}

function LoadData(debug=false) {
    console.log("Loading data...");

    // localStorage.clear();
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
            levels: [0,0],
            starteds: [false,false],
            intervals: []
        };
    }

    pogAmt = currencies.pogamount;
    pogGiveAmt = currencies.poggiveamount;

    pcPassiveLevels = passives.levels;
    pcPassiveStartedBools = passives.starteds;
    pcPassiveIntervals = passives.intervals;
    
    UpdateUI();
    
    console.log("Data loaded!");
}

// #endregion

function Tick() {
    // Handle passives
    for (let i = 0; i < pcPassiveLevels.length; i++) {
        // Stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid 
        if (pcPassiveStartedBools[i] === false) {
            if (pcPassiveLevels[i] !== 0) {
                pcPassiveStartedBools[i] = true;
                let interval = setInterval(() => {
                    pogAmt += pcPassivePowers[i];
                    UpdatePogchampsTxt();
                },1000 / (pcPassiveLevels[i] * pcPassivePowers[i]));
                pcPassiveIntervals.push(interval);
            } 
        }
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
    if (type === 0) {
        let upgradeCost = Math.floor(GetUpgradeCost(type,number));
        if (upgradeCost != null || upgradeCost != undefined) {
            if (pogAmt >= upgradeCost) {
                // Can buy upgrade
                pogAmt -= upgradeCost;
                pcPassiveLevels[number]++;
                clearInterval(pcPassiveIntervals.pop());
                pcPassiveStartedBools[number] = false;
                Tick();
                UpdateUI();
            }
        } else {
            console.trace(`Seems like upgrade (${type},${number}) failed with getting upgrade cost. :/`);
        }
    }
}

function GetUpgradeCost(type, number) {
    if (type === 0) {
        // Passive upgrade
        // return pcPassiveBaseCosts[number];
        return pcPassiveBaseCosts[number] * Math.pow(pcPassiveMults[number], pcPassiveLevels[number])
    }
}

function AddPogchamps(amt) {
    pogAmt += amt;
    UpdatePogchampsTxt();
}

// #region UI Functions

function InitializeUpgBtns() {
    for (let i = 0; i < pcPassiveUpgCount; i++) {
        upgData = [
            pcPassivePowers[i],
            pcPassiveBaseCosts[i],
            pcPassiveLevels[i]
        ];

        let upgradeDiv = document.createElement("div");
        let upgradeLabel = document.createElement("p");
        let upgBtn = document.createElement("input");

        upgradeDiv.classList.add("upgrade");

        upgBtn.type = "button";
        upgBtn.classList.add("button");
        upgBtn.id = `passivebtn0-${i}`;
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
            let upgradeLabel = document.querySelector(`p#passiveupg0-${i}`);
            let upgradeBtn = document.querySelector(`input#passivebtn0-${i}`);

            // upgradeLabel.innerHTML = `+${upgData[0]} pogchamp${(upgData[0] === 1) ? "" : "s"}/s (Lvl ${upgData[2]})`;
            UpdateText(
                upgradeLabel,
                `+${pcPassivePowers[i]} pogchamp${(pcPassivePowers[i] === 1) ? "" : "s"}/s (Lvl ${pcPassiveLevels[i]})`
            );

            upgradeBtn.value = `Cost: ${Math.floor(GetUpgradeCost(type,i))}`;
        }
    }
}

function UpdatePogchampsTxt(amt=pogAmt) {
    let pcPerSec = 0;
    for (let i = 0; i < pcPassiveLevels.length; i++) {
        pcPerSec += (pcPassiveLevels[i] * pcPassivePowers[i]);
    }
    
    UpdateText(pogchampsTxt, `${amt} pogchamps ${(pcPerSec !== 0) ? `(${pcPerSec}/s)` : ""}`);
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

