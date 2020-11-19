/**
 * Value is rounded to 1000 and fixed to 1 decimal
 * @param {number | string} value
 */
function formatWeight(value) {
    return (+value / 1000).toFixed(1);
}

/**
 * AOC - OFP WEIGHT
 * Fetch and display weight data to be loaded to the aircraft via the MCDU
 * - You can either fetch the weight from SimBrief or
 * - You can enter/edit manually each field
 */
class CDUAocOfpData {
    static ShowPage(mcdu) {
        mcdu.clearDisplay();
        mcdu.page.Current = mcdu.page.AOCOfpData;
        mcdu.activeSystem = 'ATSU';

        function updateView() {
            if (mcdu.page.Current === mcdu.page.AOCOfpData) {
                CDUAocOfpData.ShowPage(mcdu);
            }
        }

        let blockFuel = "_____[color]red";
        let taxiFuel = "____[color]red";
        let tripFuel = "_____[color]red";
        let estZfw = "__._[color]red";
        let requestButton = "SEND*[color]blue";

        if (mcdu.simbrief.sendStatus !== "READY") {
            requestButton = "SEND[color]blue";
        }

        const currentBlockFuel = mcdu.aocWeight.blockFuel || mcdu.simbrief.blockFuel;
        if (currentBlockFuel) {
            const color = mcdu.aocWeight.blockFuel ? 'blue' : 'green';
            blockFuel = `${currentBlockFuel}[color]${color}`;
        }

        const currentEstZfw = mcdu.aocWeight.estZfw || mcdu.simbrief.estZfw;
        if (currentEstZfw) {
            const color = mcdu.aocWeight.estZfw ? 'blue' : 'green';
            estZfw = `${formatWeight(currentEstZfw)}[color]${color}`;
        }

        const currentTaxiFuel = mcdu.aocWeight.taxiFuel || mcdu.simbrief.taxiFuel;
        if (currentTaxiFuel) {
            const color = mcdu.aocWeight.taxiFuel ? 'blue' : 'green';
            taxiFuel = `${currentTaxiFuel}[color]${color}`;
        }

        const currentTripFuel = mcdu.aocWeight.tripFuel || mcdu.simbrief.tripFuel;
        if (currentTripFuel) {
            const color = mcdu.aocWeight.tripFuel ? 'blue' : 'green';
            tripFuel = `${currentTripFuel}[color]${color}`;
        }

        const display = [
            ["OFP WEIGHT", undefined, undefined, "AOC"],
            ["BLOCK FUEL", "ZFW"],
            [blockFuel, estZfw],
            ["TAXI FUEL", "TRIP FUEL"],
            [taxiFuel, tripFuel],
            [""],
            [""],
            ["PAYLOAD"],
            ["*LOAD[color]blue", "PRINT*[color]blue"],
            ["REFUEL", "OFP WEIGHT REQUEST[color]blue"],
            ["*LOAD[color]blue", requestButton],
            [""],
            ["<AOC MENU"]
        ];
        mcdu.setTemplate(display);

        mcdu.leftInputDelay[0] = () => {
            return mcdu.getDelayBasic();
        };
        mcdu.onLeftInput[0] = (value) => {
            if (value === FMCMainDisplay.clrValue) {
                mcdu.aocWeight.blockFuel = "";
                updateView();
                return true;
            }
            const maxAllowableFuel = 21273;
            const enteredFuel = Math.round(+value);
            if (enteredFuel > 0 && enteredFuel <= maxAllowableFuel) {
                mcdu.aocWeight.blockFuel = enteredFuel.toString();
                updateView();
                return true;
            }
            mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
            return false;
        };

        mcdu.leftInputDelay[1] = () => {
            return mcdu.getDelayBasic();
        };
        mcdu.onLeftInput[1] = (value) => {
            if (value === FMCMainDisplay.clrValue) {
                mcdu.aocWeight.taxiFuel = "";
                updateView();
                return true;
            }
            const maxAllowableFuel = 21273;
            const enteredFuel = Math.round(+value);
            if (enteredFuel > 0 && enteredFuel <= maxAllowableFuel) {
                mcdu.aocWeight.taxiFuel = enteredFuel.toString();
                updateView();
                return true;
            }
            mcdu.showErrorMessage(mcdu.defaultInputErrorMessage);
            return false;
        };

        mcdu.leftInputDelay[3] = () => {
            return mcdu.getDelayBasic();
        };
        mcdu.onLeftInput[3] = () => {
            // TODO Set SimVar payload
        };

        mcdu.leftInputDelay[4] = () => {
            return mcdu.getDelayBasic();
        };
        mcdu.onLeftInput[4] = () => {
            if (currentBlockFuel) {
                const outerTankCapacity = 200; // Left and Right
                const innerTankCapacity = 1800; // Left and Right
                const centerTankCapacity = 3000; // Center

                const fuelWeightPerGallon = SimVar.GetSimVarValue("FUEL WEIGHT PER GALLON", "kilograms");
                let currentBlockFuelInGallons = +currentBlockFuel / +fuelWeightPerGallon;

                const outerTankFill = Math.min(outerTankCapacity, currentBlockFuelInGallons / 2);
                SimVar.SetSimVarValue(`FUEL TANK LEFT AUX QUANTITY`, "Gallons", outerTankFill);
                SimVar.SetSimVarValue(`FUEL TANK RIGHT AUX QUANTITY`, "Gallons", outerTankFill);
                currentBlockFuelInGallons -= outerTankFill * 2;

                const innerTankFill = Math.min(innerTankCapacity, currentBlockFuelInGallons / 2);
                SimVar.SetSimVarValue(`FUEL TANK LEFT MAIN QUANTITY`, "Gallons", innerTankFill);
                SimVar.SetSimVarValue(`FUEL TANK RIGHT MAIN QUANTITY`, "Gallons", innerTankFill);
                currentBlockFuelInGallons -= innerTankFill * 2;

                const centerTankFill = Math.min(centerTankCapacity, currentBlockFuelInGallons);
                SimVar.SetSimVarValue(`FUEL TANK CENTER QUANTITY`, "Gallons", centerTankFill);
                currentBlockFuelInGallons -= centerTankFill;
            }
        };

        mcdu.rightInputDelay[4] = () => {
            return mcdu.getDelayBasic();
        };
        mcdu.onRightInput[4] = () => {
            getSimBriefOfp(mcdu, updateView);
        };

        mcdu.leftInputDelay[5] = () => {
            return mcdu.getDelaySwitchPage();
        };
        mcdu.onLeftInput[5] = () => {
            CDUAocMenu.ShowPage(mcdu);
        };
    }
}
