var C008_DramaClass_Damsel_CurrentStage = 0;
var C008_DramaClass_Damsel_PlayerIsDamsel = false;
var C008_DramaClass_Damsel_PlayerIsHeroine = false;
var C008_DramaClass_Damsel_PlayerIsVillain = false;
var C008_DramaClass_Damsel_ForgetLineDone = false;
var C008_DramaClass_Damsel_SnapFingersDone = false;
var C008_DramaClass_Damsel_KnightSelection = "";
var C008_DramaClass_Damsel_CanKissHeroine = false;
var C008_DramaClass_Damsel_CanKissVillain = false;
var C008_DramaClass_Damsel_CanKneelHeroine = false;
var C008_DramaClass_Damsel_CanKneelVillain = false;
var C008_DramaClass_Damsel_IsGagged = false;

// Chapter 8 - Damsel Load
function C008_DramaClass_Damsel_Load() {

	// Checks if the player is the damsel & set the stage to the current global stage
	C008_DramaClass_Damsel_PlayerIsDamsel = (C008_DramaClass_JuliaIntro_PlayerRole == "Damsel");
	C008_DramaClass_Damsel_PlayerIsHeroine = (C008_DramaClass_JuliaIntro_PlayerRole == "Heroine");
	C008_DramaClass_Damsel_PlayerIsVillain = (C008_DramaClass_JuliaIntro_PlayerRole == "Villain");
	C008_DramaClass_Damsel_CurrentStage = C008_DramaClass_Theater_GlobalStage;
	C008_DramaClass_Damsel_CanKissHeroine = (C008_DramaClass_Damsel_PlayerIsDamsel && (ActorSpecificGetValue("Sarah", ActorLove) >= 10));
	C008_DramaClass_Damsel_CanKissVillain = (C008_DramaClass_Damsel_PlayerIsDamsel && (ActorSpecificGetValue("Amanda", ActorLove) >= 10));
	C008_DramaClass_Damsel_CanKneelHeroine = (C008_DramaClass_Damsel_PlayerIsDamsel && (ActorSpecificGetValue("Sarah", ActorLove) <= -5));
	C008_DramaClass_Damsel_CanKneelVillain = (C008_DramaClass_Damsel_PlayerIsDamsel && (ActorSpecificGetValue("Amanda", ActorLove) <= -5));

	// Load the scene parameters
	if (!C008_DramaClass_Damsel_PlayerIsDamsel) ActorLoad(C008_DramaClass_Theater_Damsel, "Theater");
	LoadInteractions();
	LeaveIcon = "Leave";
	LeaveScreen = "Theater";
	C008_DramaClass_Damsel_IsGagged = ActorIsGagged();

	// Other options for the villains & heroine when Sarah is in bondage
	if (C008_DramaClass_Damsel_PlayerIsHeroine && (C008_DramaClass_Damsel_CurrentStage == 250) && ActorSpecificInBondage("Sarah")) C008_DramaClass_Damsel_CurrentStage = 255;
	if (C008_DramaClass_Damsel_PlayerIsVillain && (C008_DramaClass_Damsel_CurrentStage == 280) && ActorSpecificInBondage("Sarah")) C008_DramaClass_Damsel_CurrentStage = 285;

}

// Chapter 8 - Damsel Run
function C008_DramaClass_Damsel_Run() {
	BuildInteraction(C008_DramaClass_Damsel_CurrentStage);
	if ((C008_DramaClass_Damsel_CurrentStage != 260) && (C008_DramaClass_Damsel_CurrentStage != 290)) DrawInteractionActor();
}

// Chapter 8 - Damsel Click
function C008_DramaClass_Damsel_Click() {	

	// Regular and inventory interactions
	ClickInteraction(C008_DramaClass_Damsel_CurrentStage);
	var ClickInv = GetClickedInventory();
	
	// If the player is the villain, she can restrain Sarah once stage 140 is reached.  Stage 220 becomes the minimum stage if she's gagged.
	if (((ClickInv == "Rope") || (ClickInv == "BallGag") || (ClickInv == "TapeGag") || (ClickInv == "ClothGag")) && C008_DramaClass_Damsel_PlayerIsVillain && (C008_DramaClass_Damsel_CurrentStage >= 140) && (C008_DramaClass_Damsel_CurrentStage < 300) && !Common_PlayerRestrained) {
		var HadRope = ActorHasInventory("Rope");
		ActorSetCloth("Underwear");
		ActorApplyRestrain(ClickInv);
		if ((ClickInv == "Rope") && !HadRope) OverridenIntroText = GetText("VillainRope");
		if ((ActorHasInventory("BallGag") || ActorHasInventory("TapeGag") || ActorHasInventory("ClothGag")) && (C008_DramaClass_Damsel_CurrentStage < 220)) {
			C008_DramaClass_Damsel_CurrentStage = 220;
			C008_DramaClass_Theater_GlobalStage = 220;
		}
		if (C008_DramaClass_Damsel_CurrentStage == 250) C008_DramaClass_Damsel_CurrentStage = 255;
		if (C008_DramaClass_Damsel_CurrentStage == 280) C008_DramaClass_Damsel_CurrentStage = 285;
		C008_DramaClass_Theater_SetPose();
	}

}

// Chapter 8 - Damsel - Sets the global stage and can alter Julia's mood
function C008_DramaClass_Damsel_GlobalStage(GlobalStage, LoveMod, SubMod) {
	
	// We can also flag for snapped fingers and a perfect play
	C008_DramaClass_Theater_GlobalStage = GlobalStage;
	if (!C008_DramaClass_Damsel_SnapFingersDone || (SubMod <= 0)) ActorSpecificChangeAttitude("Julia", LoveMod, SubMod);
	if (SubMod > 0) C008_DramaClass_Damsel_SnapFingersDone = true;
	if (LoveMod < 0) C008_DramaClass_Theater_PerfectPlay = false;
	C008_DramaClass_Theater_SetPose();
	
	// Remember who was picked for later
	if (GlobalStage == 200) C008_DramaClass_Damsel_KnightSelection = "Heroine";
	if (GlobalStage == 210) C008_DramaClass_Damsel_KnightSelection = "Villain";
	
	// If the player is the Damsel, Amanda can restrain her if she's in a Domme mood and wasn't selected
	if ((GlobalStage == 200) && (C008_DramaClass_Theater_Damsel == "Player") && (C008_DramaClass_Theater_Villain == "Amanda") && (ActorSpecificGetValue("Amanda", ActorSubmission) < 0)) {
		PlayerClothes("Underwear");
		PlayerLockInventory("Rope");
		PlayerLockInventory("ClothGag");
		OverridenIntroText = GetText("AmandaRestrainPlayer");
	}

}

// Chapter 8 - Damsel - When the player forgets her line
function C008_DramaClass_Damsel_ForgetLine() {
	if (!C008_DramaClass_Damsel_ForgetLineDone) {
		C008_DramaClass_Damsel_ForgetLineDone = true;
		C008_DramaClass_Theater_PerfectPlay = false;
		ActorSpecificChangeAttitude("Julia", 0, -1);
	}
}

// Chapter 8 - Damsel - When Sarah must choose a knight
function C008_DramaClass_Damsel_SarahChooseKnight() {
	
	// Sarah chooses the player if love is 10 or better
	if (((ActorGetValue(ActorLove) >= 10) && (C008_DramaClass_Theater_Heroine == "Player")) || ((ActorGetValue(ActorLove) < 10) && (C008_DramaClass_Theater_Heroine == "Amanda"))) {
		
		// Stage 200 means the hero was selected
		C008_DramaClass_Damsel_CurrentStage = 200;
		C008_DramaClass_Theater_GlobalStage = 200;
		C008_DramaClass_Damsel_KnightSelection = "Heroine";
		
		// If Amanda is the villain, she will restrain Sarah
		if (C008_DramaClass_Theater_Villain == "Amanda") {
			ActorSetCloth("Underwear");
			ActorSpecificSetPose("Sarah", "");
			ActorAddInventory("Rope");
			ActorAddInventory("ClothGag");
			OverridenIntroText = GetText("SarahChooseWhiteKnightRestrained");
		} else OverridenIntroText = GetText("SarahChooseWhiteKnight");

	} else {

		// Stage 210 means the villain was selected
		C008_DramaClass_Damsel_CurrentStage = 210;
		C008_DramaClass_Theater_GlobalStage = 210;
		C008_DramaClass_Damsel_KnightSelection = "Villain";
		OverridenIntroText = GetText("SarahChooseBlackKnight");

	}

}

// Chapter 8 - Damsel - The player can release the Damsel for the final act
function C008_DramaClass_Damsel_ReleaseDamsel() {
	ActorUntie();
	ActorUngag();
	ActorSetCloth("Damsel");
	C008_DramaClass_Theater_SetPose();	
}

// Chapter 8 - Damsel - When the damsel kisses the victor, it finishes the play
function C008_DramaClass_Damsel_FinalKiss() {
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsVillain && ActorSpecificHasInventory("Sarah", "Rope")) { C008_DramaClass_Damsel_ReleaseDamsel(); OverridenIntroText = GetText("AmandaReleaseForKiss"); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsHeroine && ActorSpecificHasInventory("Sarah", "Rope")) { C008_DramaClass_Damsel_ReleaseDamsel(); OverridenIntroText = GetText("AmandaReleaseForKiss"); }
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/HeroineSarahDamselPlayerKiss.jpg"; ActorSpecificChangeAttitude("Sarah", 2, 0); ActorSpecificChangeAttitude("Amanda", -3, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsHeroine) { OverridenIntroImage = "../HugImages/HeroinePlayerDamselSarahKiss.jpg"; ActorSpecificChangeAttitude("Sarah", 2, 0); ActorSpecificChangeAttitude("Amanda", -3, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsVillain) { OverridenIntroImage = "../HugImages/HeroineAmandaDamselSarahKiss.jpg"; }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/VillainAmandaDamselPlayerKiss.jpg"; ActorSpecificChangeAttitude("Amanda", 2, 0); ActorSpecificChangeAttitude("Sarah", -3, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsHeroine) { OverridenIntroImage = "../HugImages/VillainAmandaDamselSarahKiss.jpg"; }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsVillain) { OverridenIntroImage = "../HugImages/VillainPlayerDamselSarahKiss.jpg"; ActorSpecificChangeAttitude("Sarah", 2, 0); ActorSpecificChangeAttitude("Amanda", -3, 0); }
	C008_DramaClass_Theater_GlobalStage = 300;
	C008_DramaClass_Theater_Ending = "Kiss";
}

// Chapter 8 - Damsel - When the damsel hugs the victor, it finishes the play
function C008_DramaClass_Damsel_FinalHug() {
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/HeroineSarahDamselPlayerHug.jpg"; ActorSpecificChangeAttitude("Sarah", 1, 0); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsHeroine) { OverridenIntroImage = "../HugImages/HeroinePlayerDamselSarahHug.jpg"; ActorSpecificChangeAttitude("Sarah", 1, 0); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/VillainAmandaDamselPlayerHug.jpg"; ActorSpecificChangeAttitude("Amanda", 1, 0); ActorSpecificChangeAttitude("Sarah", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsVillain) { OverridenIntroImage = "../HugImages/VillainPlayerDamselSarahHug.jpg"; ActorSpecificChangeAttitude("Sarah", 1, 0); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	C008_DramaClass_Theater_GlobalStage = 300;
	C008_DramaClass_Theater_Ending = "Hug";
}

// Chapter 8 - Damsel - When the damsel kneels for the victor, it finishes the play
function C008_DramaClass_Damsel_FinalDomme() {
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/HeroineSarahDamselPlayerDomme.jpg"; ActorSpecificChangeAttitude("Sarah", 1, -2); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 260) && C008_DramaClass_Damsel_PlayerIsHeroine) { OverridenIntroImage = "../HugImages/HeroinePlayerDamselSarahDomme.jpg"; ActorSpecificChangeAttitude("Sarah", 1, 2); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsDamsel) { OverridenIntroImage = "../HugImages/VillainAmandaDamselPlayerDomme.jpg"; ActorSpecificChangeAttitude("Amanda", 1, -2); ActorSpecificChangeAttitude("Sarah", -1, 0); }
	if ((C008_DramaClass_Damsel_CurrentStage == 290) && C008_DramaClass_Damsel_PlayerIsVillain) { OverridenIntroImage = "../HugImages/VillainPlayerDamselSarahDomme.jpg"; ActorSpecificChangeAttitude("Sarah", 1, 2); ActorSpecificChangeAttitude("Amanda", -1, 0); }
	C008_DramaClass_Theater_GlobalStage = 300;
	C008_DramaClass_Theater_Ending = "Domme";
}

// Chapter 8 - Damsel - The villain can take both girls as prisoners for the final act
function C008_DramaClass_Damsel_FinalTwoPrisoners() {
	ActorSpecificChangeAttitude("Sarah", 0, 1);
	ActorSpecificChangeAttitude("Amanda", 0, 1);
	ActorSpecificChangeAttitude("Julia", 0, 1);
	C008_DramaClass_Theater_GlobalStage = 300;
	C008_DramaClass_Theater_Ending = "TwoPrisoners";
}