import { Component, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonModal, IonButton, IonButtons, IonDatetime, IonLabel, IonList, IonItem, IonDatetimeButton, IonRange, IonRouterLink, IonRouterLinkWithHref } from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import {OverlayEventDetail} from "@ionic/core/components";
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonModal, IonButton, IonDatetime, IonLabel, IonButtons, IonList, IonItem, IonDatetimeButton, FormsModule, IonRange, IonRouterLink, IonRouterLinkWithHref, NgFor],
})
export class HomePage {
	sleepStart:string = "";
	sleepEnd:string = "";
	sleepiness:number = 1;
	sleepinessTime:string = "";
	greeting:string = "";
	possibleGreetings = ["Good morning", "Good afternoon", "Good evening"];
	message = "What would you like to do today?";
	currentTime:Date;
	@ViewChild(IonModal) modal!: IonModal;
	sleepingData:String = "";
	sleepinessData:String = "";

  	constructor(public sleepService:SleepService) {
		this.currentTime = new Date();
		this.sleepStart = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
		this.sleepEnd = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
		this.sleepinessTime = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
		this.currentTime.setSeconds(0, 0);
		if (this.currentTime.getHours() >= 6 && this.currentTime.getHours() < 12) {
			this.greeting = this.possibleGreetings[0];
		} else if (this.currentTime.getHours() >= 12 && this.currentTime.getHours() < 18) {
			this.greeting = this.possibleGreetings[1];
		} else {
			this.greeting = this.possibleGreetings[2]
			this.message = "What would you like to do tonight?";
		}
	}

	ngOnInit() {
		console.log("Sleep Data", SleepService.AllSleepData);
		console.log("Sleep Start", this.sleepStart);
		console.log("Sleep End", this.sleepEnd);
		console.log("Sleepiness", this.sleepiness);
		console.log("Sleepiness Time", this.sleepinessTime);
		console.log("Overnight Data", this.allOvernightData);
		console.log("Sleepiness Data", this.allSleepinessData);
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

	cancel() {
		console.log("overnight modal dismissed with no data");
    	this.modal.dismiss(null, 'cancel');
  	}

	confirm() {
		//console.log("data confirmed");
			this.modal.dismiss([this.sleepStart, this.sleepEnd], "confirm");
			console.log("sleep data submitted");
	}

	onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
		if (event.detail.role == "confirm") {
			//console.log("success");
			//console.log(event.detail.data);
			this.sleepStart = event.detail.data[0];
			this.sleepEnd = event.detail.data[1];
			this.newSleepLog();
		}
	}

	private resetTime() {
		this.sleepStart = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
		this.sleepEnd = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
		this.sleepinessTime = new Date(this.currentTime.getTime() - (this.currentTime.getTimezoneOffset() * 60000)).toISOString();
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
		//console.log(newSleep);
		this.sleepingData + (`ID: ${newSleep.id}, Date: ${newSleep.dateString}, Summary: ${newSleep.summaryString}\n`);
		console.log("overnight", this.allOvernightData);
		this.resetTime();
	}

	public newSleepinessLog() {
		//create new sleepiness log
		var sleepinessStart:Date = new Date(this.sleepinessTime);
		var newSleepiness:StanfordSleepinessData = new StanfordSleepinessData(this.sleepiness, sleepinessStart);
		this.sleepService.logSleepinessData(newSleepiness);
		this.sleepinessData+ (`ID: ${newSleepiness.id}, Value: ${newSleepiness.sleepyValue}, Date: ${newSleepiness.dateString}, Summary: ${newSleepiness.summaryString}\n`)
		console.log("sleepy", this.allSleepinessData)
		this.resetTime();
	}

	get sleepinessDesc(): string {
		const description = StanfordSleepinessData.ScaleValues[this.sleepiness];
		if (description) {
			return description;
		} else {
			return "Select a level.";
		}

	}

	/* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
	get allSleepData() {
		return SleepService.AllSleepData;
	}

	get allOvernightData() {
		return SleepService.AllOvernightData;
	}

	get allSleepinessData() {
		return SleepService.AllSleepinessData;
	}
}
