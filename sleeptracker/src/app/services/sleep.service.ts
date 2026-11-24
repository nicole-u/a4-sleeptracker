import { Injectable } from '@angular/core';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})

export class SleepService {
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];
	private _storage:Storage | null = null;

	constructor(private storage: Storage) {
		this.init();
	}

	async init() {
		//construct the storage and set it
		const newStorage = await this.storage.create();
		this._storage = newStorage;
		await this.load();
	}

	private async load() {
		var sleepData = await this._storage?.get("sleep");
		var sleepinessData = await this._storage?.get("sleepiness");

		if (sleepData) {
			//construct sleep array
			SleepService.AllOvernightData = sleepData.map((x: any) => new OvernightSleepData(new Date(x.sleepStart), new Date(x.sleepEnd)));
			console.log("sleep data loaded");
		}

		if (sleepinessData) {
			//construct sleepiness array
			SleepService.AllSleepinessData = sleepinessData.map((x:any) => new StanfordSleepinessData(x.sleepyValue, new Date(x.time)));
			console.log("sleepiness data loaded");
		}

		//attach all the arrays
		SleepService.AllSleepData.concat(SleepService.AllOvernightData);
		SleepService.AllSleepData.concat(SleepService.AllSleepinessData);
	}

	private async save() {
		await this._storage?.set("sleep", SleepService.AllOvernightData);
		await this._storage?.set("sleepiness", SleepService.AllSleepinessData);
		console.log("data saved");
	}

	public logOvernightData(sleepData:OvernightSleepData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllOvernightData.push(sleepData);
		this.save();
	}

	public logSleepinessData(sleepData:StanfordSleepinessData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllSleepinessData.push(sleepData);
		this.save();
	}

	get AllSleepData():SleepData[] {
		return this.AllSleepData;
	}

	get AllSleepinessData():StanfordSleepinessData[] {
		return this.AllSleepinessData;
	}

	get AllOvernightData():OvernightSleepData[] {
		return this.AllOvernightData;
	}
}
