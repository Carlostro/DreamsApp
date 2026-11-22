import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRouterOutlet,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar,
  provideIonicAngular
} from '@ionic/angular';

const ionicComponents = [
  IonApp,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRouterOutlet,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar
];

@NgModule({
  imports: ionicComponents,
  exports: ionicComponents
})
export class IonicModule {
  static forRoot(): ModuleWithProviders<IonicModule> {
    return {
      ngModule: IonicModule,
      providers: [provideIonicAngular()]
    };
  }
}
