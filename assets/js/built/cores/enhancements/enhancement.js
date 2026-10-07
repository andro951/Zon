"use strict";

Zon.EffectContainer = class EffectContainer {
    constructor() {
        this._effects = null;
    }

    // private void Awake() {
    //     OnAwake();
    //     SetupManager.PreLoadSetupActions += PreLoadSetup;
    // }

    // protected virtual void OnAwake() {

    // }

    // #region PreLoad

    preLoadSetup() {
        this.constructLevelTracker();
        this.levelTracker().setMaxLevel(this.maxLevel());
    }

    // #endregion

    // #region Save/Load

    // public ISaveLoadHelper SaveLoadHelper() => new SaveLoadHelper_I(() => LevelTracker.Level, (i) => LevelTracker.Level.Value = i);

    // #endregion

    // #region PreSetLoadedValuesSetup

    preSetLoadedValuesSetup() {
        //this.constructIsUnlocked();
        //this.constructIsVisible();
        this._effects = this.getEffects();
    }

    // #endregion

    // #region IsUnlocked

    // public ListVariable_B IsUnlocked { get; private set; }
    // protected virtual void ConstructIsUnlocked() {
    //     Conjunction conjunction = new Conjunction();
    //     Equation<bool> equation = new($"{Name}{nameof(IsUnlocked)}".AddSpaces(), conjunction);
    //     IsUnlocked = new(conjunction, equation, actions: OnIsUnlockedChanged);
    // }
    // protected virtual void OnIsUnlockedChanged() {
    //     if (!IsUnlocked)
    //         LevelTracker.Reset();
    // }

    // #endregion

    // #region IsVisible
    // public ListVariable_B IsVisible { get; private set; }
    // protected virtual void ConstructIsVisible() {
    //     Conjunction conjunction = new Conjunction();
    //     Equation<bool> equation = new($"{Name}{nameof(IsVisible)}".AddSpaces(), conjunction);
    //     IsVisible = new(conjunction, equation);
    //     IsUnlocked.Add(IsVisible);

    //     IsVisible.OnChangedActions += () => gameObject.SetActive(IsVisible);
    // }

    nameNoSpaces() {
        throw new Error('NameNoSpaces method not implemented');
    }
    name() {
        return this.nameNoSpaces().addSpaces();
    }
    id() {
        throw new Error('ID getter not implemented');
    }

    levelName() {
        return "Level";
    }
    levelTracker() {
        throw new Error('LevelTracker getter not implemented');
    }
    constructLevelTracker() {
        throw new Error('ConstructLevelTracker method not implemented');
    }
    maxLevel() {
        throw new Error('MaxLevel getter not implemented');
    }
    tryUpgrade(levels) {
        throw new Error('TryUpgrade method not implemented');
    }

    // #region Effects

    effects() {
        return this._effects;
    }
    getEffects() {
        throw new Error('GetEffects method not implemented');
    }

    // protected string[] AL_Names => new string[] { LevelName };
    // protected IVariable<int>[] AL_I => new IVariable<int>[] { LevelTracker.Level };
    // protected IVariable<Triple>[] AL_T => new IVariable<Triple>[] { LevelTracker.Level };
    // protected IVariable<double>[] AL_D => new IVariable<double>[] { LevelTracker.Level };
    // protected IVariable<float>[] AL_F => new IVariable<float>[] { LevelTracker.Level };

    // protected string[] ALSP_Names => new string[] { AL_Names[0], nameof(Game.Instance.HighestStageCompleted).AddSpaces(), nameof(Game.Instance.PrestigeCount).AddSpaces() };
    // protected IVariable<int>[] ALSP_I => new IVariable<int>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount };
    // protected IVariable<Triple>[] ALSP_T => new IVariable<Triple>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount };
    // protected IVariable<double>[] ALSP_D => new IVariable<double>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount };
    // protected IVariable<float>[] ALSP_F => new IVariable<float>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount };

    // string[] IEffectContainer.AL_Names => AL_Names;
    // IVariable<int>[] IEffectContainer.AL_I => AL_I;

    // #endregion

    // #region External

    fullReset() {
        // IsUnlocked.Reset();
        // IsVisible.Reset();
        this.levelTracker().reset();
    }

    // #endregion
}

Zon.NodeTreeEffectContainer = class extends Zon.EffectContainer {
    constructor() {
        super();
    }

    // protected Image image;
    // protected TextMeshProUGUI levelText;
    // protected SimpleUILineCreator<T> lineCreator;
    // public GameObject IconBackground;

    // #region PreSetLoadedValuesSetup

    preSetLoadedValuesSetup() {
        super.preSetLoadedValuesSetup();
        //this.constructLevelTextVariable();
        // IconBackground = transform.Find(IconBackgroundName).gameObject;
        // image = IconBackground.transform.Find(IconName).GetComponent<Image>();
        // levelText = transform.Find(LevelTextBackgroundName).Find(LevelTextName).GetComponent<TextMeshProUGUI>();
        // lineCreator = new();
        // lineCreator.PanelToDrawOn = transform.parent.gameObject;

        // Button button = GetComponent<Button>();
        // button.onClick.AddListener(onClick);

        // image.sprite = Sprite;
        // Color color = Color;
        // IconBackground.GetComponent<Image>().color = color;
        // transform.Find(LevelTextBackgroundName).GetComponent<Image>().color = color;

        //this.constructDescriptionText();
    }
    preSetLoadedValuesSetup2() {
        //this.updateLines();
    }

    // #endregion

    // #region IsUnlocked

    // protected override void ConstructIsUnlocked() {
    //     //$"{this}.ConstructIsUnlocked()".Log();
    //     base.ConstructIsUnlocked();

    //     //Parents
    //     if (UnlockedBy != null) {
    //         foreach (T key in UnlockedBy.Keys.ToList()) {
    //             if (UnlockedBy[key] < 0) {
    //                 NodeTreeEffectContainer<T> parent = Get(key);
    //                 UnlockedBy[key] = parent.LevelTracker.MaxLevel;
    //                 //$"{this}.ConstructIsUnlocked(); parent.LevelTracker.MaxLevel: {parent.LevelTracker.MaxLevel}, parent: {parent}".Log();
    //             }
    //         }

    //         Conjunction conjunction = new(true, $"{Name} parent unlock levels met");
    //         foreach (KeyValuePair<T, int> pair in UnlockedBy) {
    //             //Parent Unlock levels met
    //             NodeTreeEffectContainer<T> parent = Get(pair.Key);
    //             //$"{this}.ConstructIsUnlocked(); {pair.Key}: {pair.Value}".Log();
    //             EquationVariable<bool> head = parent.LevelTracker.Level.EV_I().GreaterThanOrEqualTo(pair.Value.EV_C()).ToBool();
    //             Equation<bool> equation = new($"{Name} parent {parent.Name} level requirement", head);
    //             DependentVariable_B parentUnlockLevelMet = new(equation, false);
    //             conjunction.Add(parentUnlockLevelMet);

    //             //Actions
    //             parent.LevelTracker.Level.OnChangedActions += () => OnParentLevelChanged(parent);
    //         }
            
    //         Equation<bool> conjunctionEquation = new(conjunction.Name, conjunction.EV());
    //         ParentLevelRequirementsMet = new(conjunction, conjunctionEquation);
    //         IsUnlocked.Add(ParentLevelRequirementsMet);
    //     }
    // }
    // private ListVariable_B ParentLevelRequirementsMet;
    // protected virtual void OnParentLevelChanged(NodeTreeEffectContainer<T> parent) {
    //     if (!linesDrawn)
    //         return;

    //     bool unlocked = PathFromParentIsUnlocked(parent);
    //     UpdateRequirementLineColor(parent, unlocked);
    // }
    // private bool linesDrawn = false;
    // protected virtual bool PathFromParentIsUnlocked(NodeTreeEffectContainer<T> parent) => PathFromParentIsUnlocked(parent, UnlockedBy[parent.ID]);
    // protected virtual bool PathFromParentIsUnlocked(NodeTreeEffectContainer<T> parent, int requiredLevel) => parent.LevelTracker.Level >= requiredLevel;
    // protected virtual void UpdateRequirementLineColor(NodeTreeEffectContainer<T> parent, bool unlocked) {
    //     lineCreator.SetColor(parent.ID, GetUnlockedColor(unlocked));
    // }
    // protected virtual Color GetUnlockedColor(bool unlocked) => unlocked ? Color.green : Color.red;

    // #endregion

    // #region IsVisible

    // protected override void ConstructIsVisible() {
    //     //$"Enhancement.ConstructIsVisible(); Name: {Name}".Log();
    //     base.ConstructIsVisible();
    //     IsVisible.OnChangedActions += () => UpdateLines();
    // }
    // private void UpdateLines() {
    //     //$"{this}.UpdateLines()".Log();
    //     if (IsVisible) {
    //         TryDrawLines();
    //     }
    //     else {
    //         TryDestroyLines();
    //     }
    // }
    // protected virtual void TryDrawLines() {
    //     if (UnlockedBy == null)
    //         return;

    //     if (linesDrawn)
    //         return;

    //     foreach (KeyValuePair<T, int> pair in UnlockedBy) {
    //         NodeTreeEffectContainer<T> parent = Get(pair.Key);
    //         lineCreator.DrawLine(pair.Key, IconBackground.transform.position, parent.IconBackground.transform.position, GetUnlockedColor(PathFromParentIsUnlocked(parent, pair.Value)));
    //     }

    //     linesDrawn = true;
    // }
    // protected virtual void TryDestroyLines() {
    //     if (!linesDrawn)
    //         return;

    //     foreach (KeyValuePair<T, int> pair in UnlockedBy) {
    //         lineCreator.RemoveLine(pair.Key);
    //     }

    //     linesDrawn = false;
    // }

    // #endregion

    // #region Info and IDs

    // public virtual StringVariable DescriptionText { get; protected set; }
    // protected abstract void ConstructDescriptionText();
    // public abstract Dictionary<T, int> UnlockedBy { get; }
    // protected abstract NodeTreeEffectContainer<T> Get(T id);
    // public abstract Color Color { get; }
    // public abstract Sprite Sprite { get; }

    // #endregion

    // #region Level
    
    levelTracker = () => {
        return this._costLevelTracker;
    }
    costLevelTracker() {
        return this._costLevelTracker;
    }
    costEquation() {
        return Zon.Equation_N.create(`Enhancement Point Cost`, '1');
    }
    constructLevelTracker() {
        this._costLevelTracker = new Struct.CostLevelTracker_Equation(this.costEquation(), `${this.nameNoSpaces()}Level`);
    }

    // #endregion

    // #region UI

    // private UIStringVariable levelTextVariable;
    constructLevelTextVariable = () => {
        this.levelTextVariable = new Variable.Dependent(() => this.levelTracker.toString(), {this: this});
    }
    // protected abstract UnityAction onClick { get; }

    // #endregion
}

Zon.Enhancement = class Enhancement extends Zon.NodeTreeEffectContainer {
    constructor() {
        super();
    }

    preLoadSetup = () => {
        this._nameNoSpaces = Zon.EnhancementIDNames[this.id()];
        super.preLoadSetup();
    }
    saveLoadHelper = () => {
        
    }
    preSetLoadedValuesSetup = () => {
        super.preSetLoadedValuesSetup();
    }
    postLoadSetup = () => {
        // if (RelatedCore != CoreID) {
        //     AetherCore RelatedAetherCore = CoreManager.GetCore(RelatedCore);
        //     IsVisible.Add(RelatedAetherCore.IsUnlocked);
        // }
    }

    nameNoSpaces = () => {
        return this._nameNoSpaces;
    }

    coreID = () => {
        throw new Error('CoreID getter not implemented');
    }
    relatedCore = () => {
        return this.coreID();
    }
    aetherCore = () => {
        return Zon.coreManager.getCore(this.coreID());
    }

    constructIsVisible = () => {
        //super.constructIsVisible();
        //if (ReincarnationLocked)
        //    IsVisible.Add(ReincarnationManager.ReincarnationMenuUnlocked);
    }
    reincarnationLocked = () => {
        return false;
    }
    // protected override NodeTreeEffectContainer<EnhancementID> Get(EnhancementID enhancementID) => CoreManager.GetEnhancement(enhancementID);
    // private static Dictionary<EnhancementID, Sprite> sprites = new();
    // protected virtual EnhancementID SharedSprite => EnhancementID.None;
    // public override Sprite Sprite => GetSprite(ID);
    // public override Color Color {
    //     get {
    //         if (ReincarnationLocked) {
    //             return TalentManager.DefaultColor;
    //         }
    //         else {
    //             return CoreManager.GetCore(RelatedCore).Color;
    //         }
    //     }
    // }
    // private Sprite GetSprite(EnhancementID enhancementID) {
    //     if (SharedSprite != EnhancementID.None)
    //         enhancementID = SharedSprite;

    //     if (!sprites.ContainsKey(enhancementID))
    //         sprites.Add(enhancementID, IOManager.LoadEnhancementImage(NameNoSpaces(enhancementID)));

    //     return sprites[enhancementID];
    // }

    constructLevelTracker = () => {
        super.constructLevelTracker();
        // this.levelTracker.level.onChangedAction.add(() => {
        //     Zon.progressionManager.onLevelUpEnhancement(this);
        // });
    }
    tryUpgrade = (levels) => {
        return this.aetherCore().tryUpgradeEnhancement(this._costLevelTracker, levels);
    }

    //protected override UnityAction onClick => () => EnhancementConfirmationUIState.OnClickEnhancement(this);

    // #region Effects

    // protected string[] ALE_Names => new string[] { LevelName, Core.TotalEmpowermentLevel.Name };

    // protected IVariable<double>[] ALE_D => new IVariable<double>[] { LevelTracker.Level, Core.TotalEmpowermentLevel };
    // protected IVariable<Triple>[] ALE_T => new IVariable<Triple>[] { LevelTracker.Level, Core.TotalEmpowermentLevel };
    // protected IVariable<float>[] ALE_F => new IVariable<float>[] { LevelTracker.Level, Core.TotalEmpowermentLevel };



    // protected string[] ALSPA_Names => new string[] { AL_Names[0], nameof(Game.Instance.HighestStageCompleted).AddSpaces(), nameof(Game.Instance.PrestigeCount).AddSpaces(), Core.AttunementLevelName };
    // protected IVariable<int>[] ALSPA_I => new IVariable<int>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount, Core.AttunementLevel.Level };
    // protected IVariable<double>[] ALSPA_D => new IVariable<double>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount, Core.AttunementLevel.Level };
    // protected IVariable<Triple>[] ALSPA_T => new IVariable<Triple>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount, Core.AttunementLevel.Level };
    // protected IVariable<float>[] ALSPA_F => new IVariable<float>[] { LevelTracker.Level, Game.Instance.HighestStageCompleted, Game.Instance.PrestigeCount, Core.AttunementLevel.Level };

    // #endregion

    onReincarnationReset = () => {
        this.fullReset();
    }
}

Zon.EnhancementID = {
    BasicCombatSpheresT1: 0,
    CombatSphereDamageT1: 1,
    AbilityDamageT1: 2,
    BasicAttackEfficiencyT1: 3,
    CombatSphereMoveSpeedT1: 4,
    BasicAttackCriticalHits: 5,
    CritDamageT1: 6,
    CritRangeT1: 7,
    CritCooldownT1: 8,
    CritMasteryT1: 9,
    CritCooldownT2: 10,
    NodeStageAmplifier: 11,
    LeachingCritT1: 12,
    CritRangeT2: 13,
    NodeAssemblerPowerT1: 14,
    AetherMagnificationT1: 15,
    AetherNodePowerT1: 16,
    TalentStageAmplifier: 17,
};
Zon.EnhancementIDNames = [];
Enum.createEnum(Zon.EnhancementID, Zon.EnhancementIDNames);