"use strict";

Zon.ProcessManager = class {
    constructor() {
        this.processes = new Struct.Queue();
        this.saveProcesses = new Struct.Queue();
        this.loadProcesses = new Struct.Queue();
        this.processCount = 0;
    }
    
    add = (process) => {
        this.processes.add(process);
        this.processCount++;
    }

    addSaveProcess = (process) => {
        this.saveProcesses.add(process);
        this.processCount++;
    }

    addLoadProcess = (process) => {
        this.loadProcesses.add(process);
        this.processCount++;
    }

    get hasProcesses() {
        return this.processCount > 0;
    }

    executeAllLoadProcesses = () => {
        this._doProcessesImmediate(this.loadProcesses);
    }

    executeAllSaveProcesses = () => {
        this._doProcessesImmediate(this.saveProcesses);
    }

    executeAllRegularProcesses = () => {
        this._doProcessesImmediate(this.processes);
    }

    executeAllProcesses = () => {
        this.executeAllLoadProcesses();
        this.executeAllSaveProcesses();
        this.executeAllRegularProcesses();
    }

    //Returns true if there are still processes to run.
    executeProcesses = (yieldTime) => {
        if (!this.hasProcesses)
            return false;

        if (!this.loadProcesses.isEmpty) {
            const moreToDo = this._doProcessesYieldTime(yieldTime, this.loadProcesses);
            if (moreToDo)
                return true;
        }

        if (!this.saveProcesses.isEmpty) {
            const moreToDo = this._doProcessesYieldTime(yieldTime, this.saveProcesses);
            if (moreToDo)
                return true;
        }

        if (!this.processes.isEmpty) {
            const moreToDo = this._doProcessesYieldTime(yieldTime, this.processes);
            if (moreToDo)
                return true;
        }

        return false;
    }

    _doProcessesImmediate = (processes) => {
        let process = processes.first;
        while (!processes.isEmpty) {
            const result = process.next(Zon.ProcessCommandID.STOP_YIELDING);
            if (result.done) {
                processes.next();
                this.processCount--;
                process = processes.first;
            }
        }
    }

    //Returns true if there are still processes to run.
    _doProcessesYieldTime = (yieldTime, processes) => {
        let process = processes.first;
        while (!processes.isEmpty && performance.now() < yieldTime) {
            const result = process.next(Zon.ProcessCommandID.NONE);
            if (result.done) {
                processes.next();
                this.processCount--;
                process = processes.first;
            }
        }

        return !processes.isEmpty;
    }
    
    //Not used
    // abortAllLoadProcesses = () => {
    //     while (!this.loadProcesses.isEmpty) {
    //         const process = this.loadProcesses.first;
    //         process.next(Zon.ProcessCommandID.ABORT);
    //         process.return();
    //         this.loadProcesses.next();
    //         this.processCount--;
    //     }
    // }
}

Zon.ProcessCommandID = {
    NONE: 0,
    STOP_YIELDING: 1,
    ABORT: 2,
};
Zon.ProcessCommandIDNames = [];
Enum.createEnum(Zon.ProcessCommandID, Zon.ProcessCommandIDNames, false, false);

Zon.processManager = new Zon.ProcessManager();