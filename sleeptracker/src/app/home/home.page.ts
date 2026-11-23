import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonModal, IonButton, IonDatetime, IonLabel } from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonModal, IonButton, IonDatetime, IonLabel],
})
export class HomePage {
	sleepStart:string = "";
	sleepEnd:string = "";
	sleepiness:number = 1;
	sleepinessTime:string = "";
	greeting:string = "Hello!";
	possibleGreetings = ["Good morning!", "Good afternoon.", "Good night!"];

  	constructor(public sleepService:SleepService) {
		const currentTime = new Date();
		currentTime.setSeconds(0, 0);
	}

	ngOnInit() {
		console.log(this.allSleepData);
	}

	public calculate() {
		var sleepStartDate = new Date(this.sleepStart);
		var sleepEndDate = new Date(this.sleepEnd);
		var timeDifference = sleepEndDate.getTime() - sleepStartDate.getTime();
		if (timeDifference <= 0) {
			return "0 hours, 0 minutes";
		} else {
			var hours = Math.floor(timeDifference / (1000*60*60))
			var minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
			var result:string = hours + " hours, " + minutes + " minutes";
			return result;
		}

	}

	public newSleepLog() {
		var sleepStartDate:Date = new Date(this.sleepStart);
		sleepStartDate.setSeconds(0, 0);
		var sleepEndDate:Date = new Date(this.sleepEnd);
		sleepEndDate.setSeconds(0, 0);

		if (sleepEndDate <= sleepStartDate) {
			alert("You can't wake up before you sleep! Please fix the times.")
			return;
		}

		var newSleep:OvernightSleepData = new OvernightSleepData(sleepStartDate, sleepEndDate);
		this.sleepService.logOvernightData(newSleep);
	}

	public newSleepinessLog() {
		//create new sleepiness log
		var sleepinessStart:Date = new Date(this.sleepinessTime);
		var newSleepiness:StanfordSleepinessData = new StanfordSleepinessData(this.sleepiness, sleepinessStart);
		this.sleepService.logSleepinessData(newSleepiness);
	}
	/* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
	get allSleepData() {
		return SleepService.AllSleepData;
	}
}
