import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeHero from '@/components/home/HomeHero.vue'
import FullHandDemo from '@/components/lesson/FullHandDemo.vue'
import PotOddsLab from '@/components/labs/PotOddsLab.vue'
import HandRanks from '@/components/lesson/HandRanks.vue'
import HandCompareExamples from '@/components/lesson/HandCompareExamples.vue'
import RankOrderQuiz from '@/components/lesson/RankOrderQuiz.vue'
import BestFiveChallenge from '@/components/lesson/BestFiveChallenge.vue'
import PositionOrbit from '@/components/lesson/PositionOrbit.vue'
import ActionPotDemo from '@/components/lesson/ActionPotDemo.vue'
import StackDepthLab from '@/components/labs/StackDepthLab.vue'
import StartingHandMatrix from '@/components/labs/StartingHandMatrix.vue'
import FlopOutcomeExplorer from '@/components/labs/FlopOutcomeExplorer.vue'
import EquityExplorer from '@/components/labs/EquityExplorer.vue'
import PreflopPlan from '@/components/labs/PreflopPlan.vue'
import OutsExplorer from '@/components/labs/OutsExplorer.vue'
import EVRepeatChart from '@/components/labs/EVRepeatChart.vue'
import DecisionDrill from '@/components/lesson/DecisionDrill.vue'
import './styles/tokens.css'
import './styles/base.css'
import './styles/table.css'
import './styles/labs.css'
import './styles/lessons.css'
import './styles/preflop.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
    app.component('FullHandDemo', FullHandDemo)
    app.component('PotOddsLab', PotOddsLab)
    app.component('HandRanks', HandRanks)
    app.component('HandCompareExamples', HandCompareExamples)
    app.component('RankOrderQuiz', RankOrderQuiz)
    app.component('BestFiveChallenge', BestFiveChallenge)
    app.component('PositionOrbit', PositionOrbit)
    app.component('ActionPotDemo', ActionPotDemo)
    app.component('StackDepthLab', StackDepthLab)
    app.component('StartingHandMatrix', StartingHandMatrix)
    app.component('FlopOutcomeExplorer', FlopOutcomeExplorer)
    app.component('EquityExplorer', EquityExplorer)
    app.component('PreflopPlan', PreflopPlan)
    app.component('OutsExplorer', OutsExplorer)
    app.component('EVRepeatChart', EVRepeatChart)
    app.component('DecisionDrill', DecisionDrill)
  }
} satisfies Theme
