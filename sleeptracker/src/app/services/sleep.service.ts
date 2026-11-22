import { Injectable } from '@angular/core';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	//private static LoadDefaultData:boolean = false;
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];
	private sleepStorage:Storage | null = null; //well ig this stops it from throwing errors again

	constructor(private storage: Storage) {
		this.init();
	}

	async init() {
		//construct the storage and set it
		this.sleepStorage = await this.storage.create();
		await this.load();
	}

	private addDefaultData() {
		var goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(1, 3, 0); //1:03am
		var wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 8 * 60 * 60 * 1000); //Sleep for exactly eight hours, waking up at 9:03am
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp)); // add that person was asleep 1am-9am yesterday
		var sleepinessDate = new Date();
		sleepinessDate.setDate(sleepinessDate.getDate() - 1); //set to yesterday
		sleepinessDate.setHours(14, 38, 0); //2:38pm
		this.logSleepinessData(new StanfordSleepinessData(4, sleepinessDate)); // add sleepiness at 2pm
		goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(23, 11, 0); //11:11pm
		wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 9 * 60 * 60 * 1000); //Sleep for exactly nine hours
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp));
	}

	private async load() {
		var sleepData = await this.sleepStorage?.get("sleep");
		var sleepinessData = await this.sleepStorage?.get("sleepiness");

		if (sleepData) {
			//construct sleep array
			sleepData.forEach((x: OvernightSleepData) => {
				var newData = new OvernightSleepData(new Date(x.startOfSleep), new Date(x.endOfSleep));
				SleepService.AllOvernightData.push(newData);
			});
		}

		if (sleepinessData) {
			//construct sleepiness array
			sleepinessData.forEach((x: StanfordSleepinessData) => {
				var newData = new StanfordSleepinessData(x.sleepyValue, new Date(x.time));
				SleepService.AllSleepinessData.push(newData);
			});
		}

		//attach all the arrays
		SleepService.AllSleepData.concat(SleepService.AllOvernightData);
		SleepService.AllSleepData.concat(SleepService.AllSleepinessData);
	}

	private async save() {
		await this.sleepStorage?.set("sleep", SleepService.AllOvernightData);
		await this.sleepStorage?.set("sleepiness", SleepService.AllSleepinessData);
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

	public async clearAll() {
		await this.sleepStorage?.clear();
	}
}
