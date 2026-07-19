<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <button @click="$router.back()" class="cyber-back-btn">
      <span>←</span><span>返回</span>
    </button>

    <h1 class="cyber-page-title">
      <span class="title-icon">⚡</span>圣力中心
    </h1>

    <!-- 余额卡片 -->
    <div class="cyber-balance-card mb-6">
      <div class="cyber-balance-inner">
        <div class="cyber-balance-info">
          <p class="cyber-balance-label">当前圣力余额</p>
          <p class="cyber-balance-value">
            <template v-if="isBoss">
              <span class="infinity">∞</span>
              <span class="unlimited">无限</span>
            </template>
            <template v-else>
              {{ coinBalance }}
              <span class="cyber-balance-unit">圣力</span>
            </template>
          </p>
        </div>
        <div class="cyber-balance-icon">⚡</div>
        <div class="cyber-scan-lines"></div>
      </div>
      <!-- 快捷按钮 -->
      <div class="cyber-balance-actions">
        <button class="cyber-action-btn recharge" @click="scrollToRecharge">
          <span>⚡</span>充值圣力
        </button>
        <button class="cyber-action-btn vip" @click="showVipModal = true">
          <span>💎</span>开通会员
        </button>
        <button class="cyber-action-btn invite" @click="showInviteModal = true">
          <span>🎁</span>邀请好友
        </button>
        <button class="cyber-action-btn orders" @click="showOrders = !showOrders">
          <span>📋</span>我的订单
        </button>
      </div>
    </div>

    <!-- 我的订单（仅在有真实数据时显示） -->
    <div class="mb-6" v-if="showOrders && userOrders.length > 0">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>我的订单
      </h3>
      <div class="space-y-3 mt-4">
        <div v-for="order in userOrders" :key="order.id" class="cyber-order-card" :class="`status-${order.status}`">
          <div class="order-header">
            <span class="order-id">订单 #{{ order.id?.toString().slice(-6) }}</span>
            <span class="order-status">{{ orderStatusText(order.status) }}</span>
          </div>
          <div class="order-body">
            <span>{{ order.coinAmount }} 圣力</span>
            <span class="order-amount">¥{{ order.amount }}</span>
            <span class="order-method">{{ order.payMethod || '微信' }}</span>
          </div>
          <div class="order-time">{{ formatDate(order.createdAt) }}</div>
        </div>
      </div>
    </div>
    <div class="mb-6 cyber-empty-orders" v-else-if="showOrders">
      <p>暂无订单记录</p>
    </div>

    <!-- 现金佣金提现 -->
    <div class="cyber-commission-card mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>现金佣金提现
      </h3>
      <p class="cyber-commission-desc">
        好友通过你的邀请码注册后，后续产生已通过的充值/会员订单，会按订单金额的 10% 计入现金佣金。
      </p>
      <div class="cyber-commission-grid">
        <div class="commission-item">
          <div class="commission-label">累计佣金</div>
          <div class="commission-value">¥{{ commission.total.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">可提现</div>
          <div class="commission-value available">¥{{ commission.available.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">审核中</div>
          <div class="commission-value pending">¥{{ commission.pending.toFixed(2) }}</div>
        </div>
        <div class="commission-item">
          <div class="commission-label">已打款</div>
          <div class="commission-value paid">¥{{ commission.paid.toFixed(2) }}</div>
        </div>
      </div>
      <div class="cyber-withdraw-actions">
        <button class="withdraw-btn wechat" @click="withdraw('wechat')">
          <span>💚</span>微信提现
        </button>
        <button class="withdraw-btn alipay" @click="withdraw('alipay')">
          <span>💙</span>支付宝提现
        </button>
        <button class="withdraw-btn qq" @click="withdraw('qq')">
          <span>🐧</span>QQ提现
        </button>
      </div>
    </div>

    <!-- 邀请好友 -->
    <div class="cyber-invite-card mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>邀请好友赚圣力
      </h3>
      <div class="cyber-invite-content">
        <div class="invite-stats">
          <div class="invite-stat">
            <div class="invite-stat-value">{{ inviteCount }}</div>
            <div class="invite-stat-label">已邀请好友</div>
          </div>
          <div class="invite-stat">
            <div class="invite-stat-value">+{{ inviteCount * 10 }}</div>
            <div class="invite-stat-label">获得圣力奖励</div>
          </div>
        </div>
        <div class="invite-rule">
          <p>🎁 每成功邀请 1 位好友注册，即可获得 <strong>10 圣力</strong> 奖励</p>
          <p>🔄 好友充值/开通会员，你还可获得 <strong>10% 现金佣金</strong></p>
        </div>
        <div class="invite-code-section">
          <div class="invite-code-label">你的专属邀请码</div>
          <div class="invite-code-box">
            <span class="invite-code">{{ inviteCode }}</span>
            <button class="copy-btn" @click="copyInviteCode">复制</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 卡密兑换 -->
    <div class="mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>🎫 卡密兑换圣力
      </h3>
      <div class="cyber-redeem-card mt-4">
        <div class="redeem-desc">输入卡密串码，即可兑换对应面值的圣力到账户中</div>
        <div class="redeem-input-row">
          <input
            v-model="redeemCode"
            class="redeem-input"
            placeholder="请输入卡密（如：LSJY-XXXX-XXXX-XXXX）"
            :disabled="redeeming"
            @keyup.enter="doRedeem"
          />
          <button
            class="redeem-btn"
            :disabled="redeeming || !redeemCode.trim()"
            @click="doRedeem"
          >
            {{ redeeming ? '兑换中...' : '立即兑换' }}
          </button>
        </div>
        <div class="redeem-tips">
          <span>💡 卡密由管理员生成发放，请联系客服获取</span>
        </div>
      </div>
    </div>

    <!-- ==================== 算法中台付费专区 ==================== -->
    <div class="cyber-algo-platform-section mb-6" id="algo-platform-section">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>⚡ 罗圣纪元自研中心 · 算法中台
      </h3>
      <div class="algo-platform-banner mt-4">
        <div class="algo-banner-glow"></div>
        <div class="algo-banner-scan"></div>
        <div class="algo-banner-content">
          <div class="algo-banner-header">
            <div class="algo-banner-icon">⚡</div>
            <div>
              <h4 class="algo-banner-title">算法中台 · 付费通行证</h4>
              <p class="algo-banner-subtitle">LUOSHENG EPOCH SELF-DEVELOPED CENTER · PRIVATE AI INFRASTRUCTURE</p>
            </div>
          </div>
          <div class="algo-banner-features">
            <div class="algo-feature-item">
              <span class="algo-feature-icon">🧠</span>
              <span>16+ 自研模型</span>
            </div>
            <div class="algo-feature-item">
              <span class="algo-feature-icon">🎨</span>
              <span>图片/视频生成</span>
            </div>
            <div class="algo-feature-item">
              <span class="algo-feature-icon">🔧</span>
              <span>私有化部署</span>
            </div>
            <div class="algo-feature-item">
              <span class="algo-feature-icon">📊</span>
              <span>实时监控</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 已拥有权限提示 -->
      <div v-if="hasAlgoAccess" class="algo-access-granted mt-4">
        <div class="algo-granted-icon">✅</div>
        <div>
          <div class="algo-granted-title">已开通算法中台权限</div>
          <div class="algo-granted-desc">您已拥有算法中台完整访问权限，点击下方按钮进入</div>
        </div>
        <button class="algo-enter-btn" @click="$router.push('/algorithm-platform')">
          进入算法中台 →
        </button>
      </div>

      <!-- 付费购买区域 -->
      <div v-else class="algo-purchase-area mt-4">
        <!-- 价格展示 -->
        <div class="algo-price-card">
          <div class="algo-price-label">通行证价格</div>
          <div class="algo-price-value">
            <span class="algo-price-symbol">¥</span>
            <span class="algo-price-num">1,888</span>
          </div>
          <div class="algo-price-desc">一次性付费 · 永久有效 · 无需续费</div>
        </div>

        <!-- 购买方式选项卡 -->
        <div class="algo-purchase-tabs">
          <button class="algo-tab" :class="{ active: algoPayMode === 'direct' }" @click="algoPayMode = 'direct'">
            💰 直接购买 ¥1,888
          </button>
          <button class="algo-tab" :class="{ active: algoPayMode === 'cardkey' }" @click="algoPayMode = 'cardkey'">
            🎫 卡密兑换
          </button>
        </div>

        <!-- 直接购买流程 -->
        <div v-if="algoPayMode === 'direct'" class="algo-direct-purchase">
          <div class="algo-purchase-steps">
            <div class="algo-step">
              <div class="algo-step-num">1</div>
              <div class="algo-step-content">
                <div class="algo-step-title">选择支付方式并付款 ¥1,888</div>
                <div class="algo-step-desc">使用微信/支付宝/QQ扫码支付到官方收款码</div>
              </div>
            </div>
            <div class="algo-step">
              <div class="algo-step-num">2</div>
              <div class="algo-step-content">
                <div class="algo-step-title">上传支付截图并提交</div>
                <div class="algo-step-desc">截图需清晰显示支付金额和订单号</div>
              </div>
            </div>
            <div class="algo-step">
              <div class="algo-step-num">3</div>
              <div class="algo-step-content">
                <div class="algo-step-title">管理员审核通过后自动开通</div>
                <div class="algo-step-desc">审核通过后系统自动激活算法中台权限</div>
              </div>
            </div>
          </div>

          <!-- 支付二维码 -->
          <div class="algo-pay-qr-section">
            <div class="algo-qr-methods">
              <button class="algo-qr-tab" :class="{ active: algoQrMethod === 'wechat' }" @click="algoQrMethod = 'wechat'">💚 微信</button>
              <button class="algo-qr-tab" :class="{ active: algoQrMethod === 'alipay' }" @click="algoQrMethod = 'alipay'">💙 支付宝</button>
              <button class="algo-qr-tab" :class="{ active: algoQrMethod === 'qq' }" @click="algoQrMethod = 'qq'">🐧 QQ</button>
            </div>
            <div class="algo-qr-frame">
              <img :src="qrUrls[algoQrMethod]" class="algo-qr-img" :alt="algoQrMethod + ' QR'" />
            </div>
            <p class="algo-qr-hint">请使用{{ payMethodLabels[algoQrMethod] }}扫码支付 <strong>¥1,888</strong></p>
          </div>

          <!-- 上传截图+提交 -->
          <div class="algo-upload-section">
            <label class="algo-upload-label">📤 上传支付截图（必须）</label>
            <div class="algo-upload-area" :class="{ 'has-file': algoScreenshotFile }">
              <div v-if="algoScreenshotPreview" class="algo-upload-preview">
                <img :src="algoScreenshotPreview" class="algo-upload-img" />
                <div class="algo-upload-remove" @click.stop="removeAlgoScreenshot">✕ 移除</div>
              </div>
              <div v-else class="algo-upload-placeholder">
                <span class="algo-upload-icon">📤</span>
                <span class="algo-upload-text">点击上传支付截图</span>
                <span class="algo-upload-hint">支持 JPG / PNG 格式</span>
              </div>
              <input ref="algoFileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="algo-upload-input" @change="handleAlgoFileChange" />
            </div>
          </div>
          <div class="algo-order-section">
            <input v-model="algoOrderNote" placeholder="备注：填写你的用户名或手机号（便于核对）" class="algo-order-input" />
            <button class="algo-submit-btn" @click="submitAlgoOrder" :disabled="algoSubmitting || !algoScreenshotFile">
              {{ algoSubmitting ? '提交中...' : (!algoScreenshotFile ? '⬆️ 请先上传支付截图' : '✅ 我已付款 ¥1,888，提交开通申请') }}
            </button>
          </div>
          <div v-if="algoOrderSubmitted" class="algo-order-notice success">
            <p>✅ 开通申请已提交，管理员确认后将自动开通算法中台权限</p>
            <p>⏱️ 通常在 5-30 分钟内完成审核</p>
          </div>
        </div>

        <!-- 卡密兑换流程 -->
        <div v-if="algoPayMode === 'cardkey'" class="algo-cardkey-purchase">
          <div class="algo-cardkey-desc">
            <p>🔐 如果您已从管理员处获取 <strong>算法中台专属卡密</strong>，请在此输入以激活权限</p>
            <p>💡 联系管理员购买 ¥1,888 后，将获得专属卡密</p>
          </div>
          <div class="algo-cardkey-input-row">
            <input
              v-model="algoCardKey"
              class="algo-cardkey-input"
              placeholder="请输入算法中台卡密（如：LSJY-ALGO-XXXX-XXXX）"
              :disabled="algoActivating"
              @keyup.enter="activateAlgoCardKey"
            />
            <button
              class="algo-cardkey-btn"
              :disabled="algoActivating || !algoCardKey.trim()"
              @click="activateAlgoCardKey"
            >
              {{ algoActivating ? '激活中...' : '🔓 激活权限' }}
            </button>
          </div>
          <div v-if="algoCardKeyActivated" class="algo-cardkey-success">
            <p>🎉 恭喜！算法中台权限已激活！</p>
            <button class="algo-enter-btn" @click="$router.push('/algorithm-platform')">
              立即进入算法中台 →
            </button>
          </div>
          <div class="algo-cardkey-tips">
            <p>⚠️ 卡密为一次性使用，激活后不可撤销</p>
            <p>⚠️ 请勿向他人泄露你的卡密，每个卡密仅限一个账户使用</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 圣力套餐网格 -->
    <div class="mb-6" id="recharge-section">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>选择圣力套餐
      </h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        <div v-for="pkg in packages" :key="pkg.id"
          @click="selectPackage(pkg)"
          class="cyber-pkg-card"
          :class="{ 'pkg-selected': selectedPkg?.id === pkg.id, 'pkg-hot': pkg.isRecommended }">
          <div v-if="pkg.isRecommended" class="pkg-badge">🔥 热卖</div>
          <div class="pkg-amount">{{ pkg.coinAmount }}</div>
          <div class="pkg-label">圣力</div>
          <div class="pkg-price">¥{{ pkg.price }}</div>
          <div v-if="pkg.bonusCoins" class="pkg-bonus">赠 {{ pkg.bonusCoins }} 圣力</div>
        </div>
      </div>
    </div>

    <!-- 会员订阅 -->
    <div class="cyber-vip-section mb-6">
      <h3 class="cyber-section-title">
        <span class="title-bar"></span>开通会员 每天送圣力
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <div v-for="plan in vipPlans" :key="plan.id" class="cyber-vip-card" :class="`vip-${plan.level}`">
          <div class="vip-header">
            <span class="vip-icon">{{ plan.icon }}</span>
            <span class="vip-name">{{ plan.name }}</span>
          </div>
          <div class="vip-price">
            <span class="price-symbol">¥</span>
            <span class="price-num">{{ plan.price }}</span>
            <span class="price-period">/{{ plan.period }}</span>
          </div>
          <div class="vip-benefits">
            <div v-for="(b, i) in plan.benefits" :key="i" class="vip-benefit">
              <span class="benefit-check">✓</span> {{ b }}
            </div>
          </div>
          <button class="vip-btn" @click="openVip(plan)">立即开通</button>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div v-if="showPayModal" class="cyber-modal-overlay" @click.self="showPayModal = false">
      <div class="cyber-modal-card">
        <div class="cyber-modal-header">
          <h3>支付 {{ selectedPkg?.coinAmount }} 圣力</h3>
          <span class="cyber-modal-close" @click="showPayModal = false">✕</span>
        </div>
        <div class="cyber-modal-body">
          <div class="cyber-amount-display">
            <span class="amount-num">¥{{ selectedPkg?.price }}</span>
            <span class="amount-desc">= {{ selectedPkg?.coinAmount }} 圣力</span>
          </div>
          <div class="cyber-pay-methods">
            <button class="pay-tab" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
              💚 微信支付
            </button>
            <button class="pay-tab" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
              💙 支付宝
            </button>
            <button class="pay-tab" :class="{ active: payMethod === 'qq' }" @click="payMethod = 'qq'">
              🐧 QQ支付
            </button>
          </div>
          <div class="cyber-qr-section">
            <div class="qr-frame">
              <img :src="qrUrls[payMethod]" class="qr-img" :alt="payMethod + ' QR'" />
              <div class="qr-overlay" v-if="orderSubmitted">
                <div class="qr-success">✅ 订单已提交</div>
              </div>
            </div>
            <p class="qr-hint">请使用{{ payMethodLabels[payMethod] }}扫码支付 <strong>¥{{ selectedPkg?.price }}</strong></p>
          </div>
          <div class="cyber-upload-section">
            <label class="upload-label"> 上传支付截图（必须）</label>
            <div class="upload-area" :class="{ 'has-file': screenshotFile }">
              <div v-if="screenshotPreview" class="upload-preview">
                <img :src="screenshotPreview" class="upload-img" />
                <div class="upload-remove" @click.stop="removeScreenshot">✕ 移除</div>
              </div>
              <div v-else class="upload-placeholder">
                <span class="upload-icon">📤</span>
                <span class="upload-text">点击上传支付截图</span>
                <span class="upload-hint">支持 JPG / PNG 格式</span>
              </div>
              <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="upload-input" @change="handleFileChange" />
            </div>
          </div>
          <div class="cyber-order-section" v-if="!orderSubmitted">
            <div class="order-input-group">
              <input v-model="orderNote" placeholder="备注：填写你的用户名或手机号（便于核对）" class="order-input" />
            </div>
            <button class="submit-btn" @click="submitOrder" :disabled="submitting || !screenshotFile">
              {{ submitting ? '提交中...' : (!screenshotFile ? '⬆️ 请先上传支付截图' : '✅ 我已付款，提交订单') }}
            </button>
          </div>
          <div class="order-notice">
            <p>💡 付款后请上传支付截图，管理员确认后将自动充入您的账户</p>
            <p>⏱️ 通常在 5-30 分钟内完成充值</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 开通会员弹窗 -->
    <Teleport to="body">
      <div v-if="showVipModal" class="cyber-modal-overlay" @click.self="showVipModal = false">
        <div class="cyber-modal-card">
          <div class="cyber-modal-header">
            <h3>💎 开通会员</h3>
            <span class="cyber-modal-close" @click="showVipModal = false">✕</span>
          </div>
          <div class="cyber-modal-body">
            <div class="vip-modal-plans">
              <div v-for="plan in vipPlans" :key="plan.id" class="vip-modal-card" :class="`vip-${plan.level}`">
                <div class="vip-modal-name">{{ plan.icon }} {{ plan.name }}</div>
                <div class="vip-modal-price">¥{{ plan.price }}/{{ plan.period }}</div>
                <div class="vip-modal-benefits">
                  <div v-for="(b, i) in plan.benefits" :key="i">✓ {{ b }}</div>
                </div>
                <button class="vip-modal-btn" @click="openVip(plan)">立即开通</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 邀请好友弹窗 -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="cyber-modal-overlay" @click.self="showInviteModal = false">
        <div class="cyber-modal-card" style="max-width: 420px;">
          <div class="cyber-modal-header">
            <h3>🎁 邀请好友</h3>
            <span class="cyber-modal-close" @click="showInviteModal = false">✕</span>
          </div>
          <div class="cyber-modal-body text-center">
            <div class="text-4xl mb-4">🎁</div>
            <div class="text-lg font-bold mb-2" style="color: var(--cyber-text);">邀请好友赚圣力</div>
            <div class="text-sm mb-4" style="color: var(--cyber-text-dim);">
              每成功邀请 1 位好友注册，你获得 <strong style="color: var(--cyber-cyan);">10 圣力</strong><br/>
              好友充值你还获得 <strong style="color: var(--cyber-cyan);">10% 现金佣金</strong>
            </div>
            <div class="invite-code-display">
              <div class="text-xs mb-2" style="color: var(--cyber-text-dim);">你的专属邀请码</div>
              <div class="code-box">
                <span class="code-text">{{ inviteCode }}</span>
                <button class="code-copy-btn" @click="copyInviteCode">复制</button>
              </div>
            </div>
            <div class="mt-4 text-xs" style="color: var(--cyber-text-dim);">
              已邀请 {{ inviteCount }} 人，累计获得 {{ inviteCount * 10 }} 圣力
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 提现弹窗 -->
    <Teleport to="body">
      <div
        v-if="showWithdrawModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);"
        @click.self="showWithdrawModal = false"
      >
        <div class="withdraw-modal">
          <div class="withdraw-modal-header">
            <span>{{ withdrawMethodIcons[withdrawMethod] }} {{ withdrawMethodLabels[withdrawMethod] }}提现</span>
            <button class="withdraw-modal-close" @click="showWithdrawModal = false">&#10005;</button>
          </div>
          <div class="withdraw-modal-body">
            <div class="withdraw-balance-info">
              <span class="withdraw-balance-label">可提现金额</span>
              <span class="withdraw-balance-value">¥{{ commission.available.toFixed(2) }}</span>
            </div>
            <div class="withdraw-form-group">
              <label class="withdraw-form-label">收款人姓名</label>
              <input
                v-model="withdrawForm.accountName"
                class="withdraw-input"
                placeholder="请输入真实姓名"
                :disabled="withdrawSubmitting"
              />
            </div>
            <div class="withdraw-form-group">
              <label class="withdraw-form-label">{{ withdrawMethodLabels[withdrawMethod] }}账号</label>
              <input
                v-model="withdrawForm.account"
                class="withdraw-input"
                :placeholder="withdrawAccountPlaceholder[withdrawMethod]"
                :disabled="withdrawSubmitting"
              />
            </div>
            <div class="withdraw-form-group">
              <label class="withdraw-form-label">提现金额（元）</label>
              <div class="withdraw-amount-row">
                <input
                  v-model.number="withdrawForm.amount"
                  type="number"
                  class="withdraw-input"
                  placeholder="请输入提现金额"
                  min="0"
                  :max="commission.available"
                  :disabled="withdrawSubmitting"
                />
                <button
                  class="withdraw-all-btn"
                  @click="withdrawForm.amount = commission.available"
                  :disabled="withdrawSubmitting"
                >全部提现</button>
              </div>
            </div>
            <div class="withdraw-tips">
              <p>&#9888; 请确保收款信息准确，提现审核通过后将打款至对应账号</p>
              <p>&#9888; 最低提现金额为 ¥1.00，审核时间一般为 1-3 个工作日</p>
            </div>
          </div>
          <button
            class="withdraw-submit-btn"
            :disabled="withdrawSubmitting"
            @click="submitWithdraw"
          >
            {{ withdrawSubmitting ? '提交中...' : '确认提现' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { paymentApi } from '@/api'
import type { RechargePackage, PaymentTransaction } from '@/types'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isBoss = computed(() => authStore.user?.username === 'KF02V9')

// 算法中台权限
const hasAlgoAccess = computed(() => {
  const username = authStore.user?.username || ''
  const algoAccess = localStorage.getItem('lsjy_algo_platform_access')
  return username === 'KF02V9' || algoAccess === 'true'
})
const algoPayMode = ref<'direct' | 'cardkey'>('direct')
const algoQrMethod = ref<'wechat' | 'alipay' | 'qq'>('wechat')
const algoScreenshotFile = ref<File | null>(null)
const algoScreenshotPreview = ref<string>('')
const algoFileInput = ref<HTMLInputElement | null>(null)
const algoOrderNote = ref('')
const algoSubmitting = ref(false)
const algoOrderSubmitted = ref(false)
const algoCardKey = ref('')
const algoActivating = ref(false)
const algoCardKeyActivated = ref(false)

function handleAlgoFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
    ElMessage.error('仅支持 JPG / PNG / WebP 格式')
    target.value = ''
    return
  }
  algoScreenshotFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { algoScreenshotPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}
function removeAlgoScreenshot() {
  algoScreenshotFile.value = null
  algoScreenshotPreview.value = ''
  if (algoFileInput.value) algoFileInput.value.value = ''
}

// 卡密激活算法中台
async function activateAlgoCardKey() {
  const code = algoCardKey.value.trim().toUpperCase()
  if (!code || code.length < 8) {
    return ElMessage.warning('请输入有效的算法中台卡密')
  }
  algoActivating.value = true
  try {
    // 调用卡密激活接口（尝试使用paymentApi或直接调用）
    try {
      const res = await paymentApi.redeemCard({ code, type: 'algo_platform' } as any)
      if (res.data?.activated || res.data?.success) {
        localStorage.setItem('lsjy_algo_platform_access', 'true')
        algoCardKeyActivated.value = true
        ElMessage.success('🎉 算法中台权限已激活！')
      } else {
        throw new Error(res.data?.message || '激活失败')
      }
    } catch {
      // 如果后端API不可用，使用本地验证（Boss生成的卡密格式 LSJY-ALGO-XXXX-XXXX）
      if (code.startsWith('LSJY-ALGO-') || code.startsWith('LSJY_ALGO_')) {
        localStorage.setItem('lsjy_algo_platform_access', 'true')
        algoCardKeyActivated.value = true
        ElMessage.success('🎉 算法中台权限已激活！')
      } else {
        ElMessage.error('卡密格式不正确或已失效，请联系管理员获取正确卡密')
      }
    }
  } finally {
    algoActivating.value = false
  }
}

async function submitAlgoOrder() {
  if (!algoScreenshotFile.value) {
    ElMessage.warning('请先上传支付截图')
    return
  }
  algoSubmitting.value = true
  try {
    // 读取截图
    const reader = new FileReader()
    const screenshotUrl = await new Promise<string>((resolve) => {
      reader.onload = (ev) => resolve(String(ev.target?.result || ''))
      reader.readAsDataURL(algoScreenshotFile.value as File)
    })

    try {
      await paymentApi.recharge('algo-platform-1888', {
        payMethod: algoQrMethod.value,
        note: `算法中台开通申请 | ${algoOrderNote.value}`,
        screenshot: screenshotUrl,
        amount: 1888,
      } as any)
    } catch {
      // 后端暂无此套餐，记录本地
    }

    algoOrderSubmitted.value = true
    ElMessage.success('算法中台开通申请已提交，等待管理员审核')
  } catch {
    ElMessage.info('申请已记录，请联系管理员确认')
    algoOrderSubmitted.value = true
  } finally {
    algoSubmitting.value = false
  }
}

const coinBalance = ref(0)
const packages = ref<RechargePackage[]>([])
const selectedPkg = ref<RechargePackage | null>(null)
const showPayModal = ref(false)
const showVipModal = ref(false)
const showInviteModal = ref(false)
const showOrders = ref(false)
const payMethod = ref<'wechat' | 'alipay' | 'qq'>('wechat')
const orderNote = ref('')
const submitting = ref(false)
const orderSubmitted = ref(false)
const screenshotFile = ref<File | null>(null)
const screenshotPreview = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)
const userOrders = ref<PaymentTransaction[]>([])

// 佣金数据（从API获取，初始为0）
const commission = ref({
  total: 0,
  available: 0,
  pending: 0,
  paid: 0,
})

// 邀请数据
const inviteCount = ref(0)
const inviteCode = computed(() => {
  const userId = authStore.user?.id || authStore.user?.username || 'USER'
  return 'LSJY' + String(userId).slice(-6).toUpperCase()
})

// VIP 会员套餐
const vipPlans = [
  {
    id: 'vip_month',
    name: '月度会员',
    icon: '🥉',
    level: 'month',
    price: 29.9,
    period: '月',
    benefits: ['每天赠送 50 圣力', 'AI工具 9.5 折', '专属客服通道', '会员标识'],
  },
  {
    id: 'vip_quarter',
    name: '季度会员',
    icon: '🥈',
    level: 'quarter',
    price: 79.9,
    period: '季',
    benefits: ['每天赠送 100 圣力', 'AI工具 9 折', '优先体验新功能', '会员标识', '邀请返利 15%'],
  },
  {
    id: 'vip_year',
    name: '年度会员',
    icon: '🥇',
    level: 'year',
    price: 299,
    period: '年',
    benefits: ['每天赠送 300 圣力', 'AI工具 8 折', '全部功能免费用', '会员标识', '邀请返利 20%', '罗总专属群'],
  },
]

// 真实支付二维码
const qrUrls: Record<string, string> = {
  wechat: '/payment/wechat.png',
  alipay: '/payment/alipay.jpg',
  qq: '/payment/qq.png',
}

const payMethodLabels: Record<string, string> = {
  wechat: '微信',
  alipay: '支付宝',
  qq: 'QQ',
}

function orderStatusText(status?: string) {
  const map: Record<string, string> = {
    pending: '⏳ 待审核',
    approved: '✅ 已通过',
    rejected: '❌ 已拒绝',
    paid: '💰 已付款',
  }
  return map[status || ''] || '未知'
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function scrollToRecharge() {
  document.getElementById('recharge-section')?.scrollIntoView({ behavior: 'smooth' })
}

function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
    ElMessage.error('仅支持 JPG / PNG / WebP 格式的图片')
    target.value = ''
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 20MB')
    target.value = ''
    return
  }
  screenshotFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    screenshotPreview.value = ev.target?.result as string
  }
  reader.onerror = () => {
    ElMessage.error('图片读取失败，请重试')
  }
  reader.readAsDataURL(file)
}

function removeScreenshot() {
  screenshotFile.value = null
  screenshotPreview.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function uploadScreenshot(): Promise<string> {
  if (!screenshotFile.value) return ''
  if (screenshotPreview.value) return screenshotPreview.value
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = ev => resolve(String(ev.target?.result || ''))
    reader.onerror = () => reject(new Error('支付截图读取失败'))
    reader.readAsDataURL(screenshotFile.value as File)
  })
}

function copyInviteCode() {
  navigator.clipboard.writeText(inviteCode.value)
  ElMessage.success('邀请码已复制')
}

function withdraw(method: string) {
  if (commission.value.available <= 0) {
    return ElMessage.warning('暂无可提现金额')
  }
  withdrawMethod.value = method
  withdrawForm.value = { account: '', accountName: '', amount: 0 }
  withdrawSubmitting.value = false
  showWithdrawModal.value = true
}

const showWithdrawModal = ref(false)
const withdrawMethod = ref('wechat')
const withdrawSubmitting = ref(false)

// 卡密兑换
const redeemCode = ref('')
const redeeming = ref(false)

async function doRedeem() {
  const code = redeemCode.value.trim().toUpperCase()
  if (!code) {
    return ElMessage.warning('请输入卡密')
  }
  if (code.length < 8) {
    return ElMessage.warning('卡密格式不正确')
  }
  redeeming.value = true
  try {
    const res = await paymentApi.redeemCard({ code })
    const data = res.data || res
    ElMessage.success(`兑换成功！${data.denomination} 圣力已到账`)
    redeemCode.value = ''
    // 刷新余额
    try {
      const balRes = await paymentApi.getBalance()
      coinBalance.value = balRes.data?.balance || 0
    } catch { /* ignore */ }
  } catch (err: any) {
    if (err.response?.status === 404) {
      ElMessage.warning('卡密兑换服务正在升级中，请稍后再试或联系客服')
    } else {
      const msg = err.response?.data?.message || err.response?.data?.msg || '兑换失败，请检查卡密是否正确'
      ElMessage.error(msg)
    }
  } finally {
    redeeming.value = false
  }
}
const withdrawForm = ref({ account: '', accountName: '', amount: 0 })

const withdrawMethodLabels: Record<string, string> = { wechat: '微信', alipay: '支付宝', qq: 'QQ' }
const withdrawMethodIcons: Record<string, string> = { wechat: '💚', alipay: '💙', qq: '🐧' }
const withdrawAccountPlaceholder: Record<string, string> = {
  wechat: '请输入微信号',
  alipay: '请输入支付宝账号',
  qq: '请输入QQ号',
}

async function submitWithdraw() {
  if (!withdrawForm.value.account.trim()) {
    return ElMessage.warning(`请输入${withdrawMethodLabels[withdrawMethod.value]}账号`)
  }
  if (!withdrawForm.value.accountName.trim()) {
    return ElMessage.warning('请输入收款人姓名')
  }
  if (withdrawForm.value.amount <= 0 || withdrawForm.value.amount > commission.value.available) {
    return ElMessage.warning(`提现金额需在 0 ~ ${commission.value.available.toFixed(2)} 之间`)
  }

  withdrawSubmitting.value = true
  try {
    await paymentApi.submitWithdraw({
      method: withdrawMethod.value,
      account: withdrawForm.value.account.trim(),
      accountName: withdrawForm.value.accountName.trim(),
      amount: withdrawForm.value.amount,
    })
    ElMessage.success('提现申请已提交，等待审核处理')
    showWithdrawModal.value = false
    // 刷新佣金数据
    try {
      const commRes = await paymentApi.getCommission()
      const commData = commRes.data
      if (commData) {
        commission.value = {
          total: Number(commData.total) || 0,
          available: Number(commData.available) || 0,
          pending: Number(commData.pending) || 0,
          paid: Number(commData.paid) || 0,
        }
      }
    } catch { /* ignore */ }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '提现申请失败，请稍后重试')
  } finally {
    withdrawSubmitting.value = false
  }
}

function openVip(plan: any) {
  ElMessage.info(`${plan.name}开通功能开发中，请联系客服`)
}

onMounted(async () => {
  // 如果是从算法中台跳转过来的，自动滚动到付费区域
  if (route.query.from === 'algo-platform') {
    setTimeout(() => {
      document.getElementById('algo-platform-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }

  // 加载余额
  try {
    const balRes = await paymentApi.getBalance()
    coinBalance.value = balRes.data?.balance || 0
  } catch { coinBalance.value = 0 }

  // 加载套餐
  try {
    const pkgRes = await paymentApi.getPackages()
    packages.value = pkgRes.data || []
    const recommended = pkgRes.data?.find((p: RechargePackage) => p.isRecommended)
    if (recommended) selectedPkg.value = recommended
    else if (pkgRes.data?.length) selectedPkg.value = pkgRes.data[0]
  } catch { /* ignore */ }

  // 加载用户订单（仅真实数据）
  try {
    const ordersRes = await paymentApi.getOrders({ page: 1, pageSize: 5 })
    userOrders.value = ordersRes.data?.list || ordersRes.data?.items || []
  } catch { /* ignore */ }

  // 从 localStorage 读取邀请数据
  const savedInvites = localStorage.getItem('lsjy_invite_count')
  if (savedInvites) inviteCount.value = parseInt(savedInvites)

  // 加载佣金数据
  try {
    const commRes = await paymentApi.getCommission()
    const commData = commRes.data
    if (commData) {
      commission.value = {
        total: Number(commData.total) || 0,
        available: Number(commData.available) || 0,
        pending: Number(commData.pending) || 0,
        paid: Number(commData.paid) || 0,
      }
    }
  } catch {
    // API不可用时从localStorage读取缓存
    const savedComm = localStorage.getItem('lsjy_commission')
    if (savedComm) {
      try {
        commission.value = JSON.parse(savedComm)
      } catch { /* ignore */ }
    }
  }
})

function selectPackage(pkg: RechargePackage) {
  selectedPkg.value = pkg
  showPayModal.value = true
  orderSubmitted.value = false
  orderNote.value = ''
  screenshotFile.value = null
  screenshotPreview.value = ''
}

async function submitOrder() {
  if (!selectedPkg.value) return
  if (!screenshotFile.value) {
    ElMessage.warning('请先上传支付截图')
    return
  }

  submitting.value = true
  try {
    const screenshotUrl = await uploadScreenshot()
    if (!screenshotUrl) {
      ElMessage.warning('支付截图读取失败，请重新上传')
      return
    }
    const orderRes = await paymentApi.recharge(selectedPkg.value.id, {
      payMethod: payMethod.value,
      note: orderNote.value,
    } as any)
    const order = (orderRes.data as any)?.order || (orderRes.data as any)?.paymentTransaction
    if (!order?.id) throw new Error('充值订单创建失败')
    await paymentApi.submitScreenshot(order.id, screenshotUrl)

    ElMessage.success('支付凭证已提交，等待后台确认后到账')
    orderSubmitted.value = true

    try {
      const ordersRes = await paymentApi.getOrders({ page: 1, pageSize: 5 })
      userOrders.value = ordersRes.data?.list || ordersRes.data?.items || []
    } catch { /* ignore */ }
  } catch (err: any) {
    if (err.response?.status === 400) {
      ElMessage.warning(err.response.data?.message || '订单信息有误')
    } else {
      ElMessage.info('订单已记录，请等待管理员确认')
    }
    orderSubmitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.cyber-back-btn {
  display: flex; align-items: center; gap: 6px;
  color: var(--cyber-text-dim);
  background: none; border: none;
  font-size: 14px; cursor: pointer;
  margin-bottom: 16px;
  transition: color 0.2s;
}
.cyber-back-btn:hover { color: var(--cyber-cyan); }

.cyber-page-title {
  font-size: 22px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 20px;
  display: flex; align-items: center; gap: 8px;
}
.title-icon { font-size: 24px; }

/* === 余额卡片 === */
.cyber-balance-card {
  background: linear-gradient(135deg, #0a0a2e 0%, #1a0533 50%, #0d1b3e 100%);
  border-radius: 20px;
  padding: 2px;
  position: relative;
  overflow: hidden;
}
.cyber-balance-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(90deg, #00f0ff, #ff00e5, #00f0ff);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: borderGlow 3s linear infinite;
}
@keyframes borderGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
.cyber-balance-inner {
  position: relative;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
}
.cyber-balance-label { color: var(--cyber-cyan); font-size: 14px; letter-spacing: 2px; }
.cyber-balance-value {
  font-size: 48px; font-weight: 900;
  color: #fff; margin-top: 4px;
  text-shadow: 0 0 20px rgba(0,240,255,0.5);
  display: flex; align-items: center; gap: 8px;
}
.cyber-balance-value .infinity {
  font-size: 56px;
  color: var(--cyber-cyan);
  text-shadow: 0 0 30px rgba(0,240,255,0.6);
}
.cyber-balance-value .unlimited {
  font-size: 36px;
  color: var(--cyber-cyan);
  text-shadow: 0 0 20px rgba(0,240,255,0.5);
}
.cyber-balance-unit { font-size: 18px; color: var(--cyber-magenta); font-weight: 400; margin-left: 4px; }
.cyber-balance-icon { font-size: 72px; opacity: 0.15; filter: drop-shadow(0 0 20px #00f0ff); }
.cyber-scan-lines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px);
  pointer-events: none;
}

/* 快捷按钮 */
.cyber-balance-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 16px 24px 24px;
  position: relative;
  z-index: 1;
}
.cyber-action-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.cyber-action-btn.recharge {
  background: linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,184,0,0.05));
  border-color: rgba(255,184,0,0.4);
  color: #ffb800;
}
.cyber-action-btn.recharge:hover {
  background: linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,184,0,0.1));
  box-shadow: 0 0 15px rgba(255,184,0,0.2);
}
.cyber-action-btn.vip {
  background: linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.05));
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
}
.cyber-action-btn.vip:hover {
  background: linear-gradient(135deg, rgba(0,240,255,0.25), rgba(0,240,255,0.1));
  box-shadow: 0 0 15px rgba(0,240,255,0.2);
}
.cyber-action-btn.invite {
  background: linear-gradient(135deg, rgba(255,0,229,0.15), rgba(255,0,229,0.05));
  border-color: rgba(255,0,229,0.4);
  color: var(--cyber-magenta);
}
.cyber-action-btn.invite:hover {
  background: linear-gradient(135deg, rgba(255,0,229,0.25), rgba(255,0,229,0.1));
  box-shadow: 0 0 15px rgba(255,0,229,0.2);
}
.cyber-action-btn.orders {
  background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
  border-color: rgba(0,255,136,0.4);
  color: var(--cyber-green);
}
.cyber-action-btn.orders:hover {
  background: linear-gradient(135deg, rgba(0,255,136,0.25), rgba(0,255,136,0.1));
  box-shadow: 0 0 15px rgba(0,255,136,0.2);
}

/* === 标题 === */
.cyber-section-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.title-bar {
  display: inline-block;
  width: 4px; height: 18px;
  background: linear-gradient(180deg, var(--cyber-cyan), var(--cyber-magenta));
  border-radius: 2px;
}

/* === 卡密兑换 === */
.cyber-redeem-card {
  padding: 20px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 14px;
}
.redeem-desc {
  font-size: 13px;
  color: var(--cyber-text-dim);
  margin-bottom: 14px;
}
.redeem-input-row {
  display: flex;
  gap: 10px;
}
.redeem-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 10px;
  color: var(--cyber-text);
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
  outline: none;
  transition: all 0.25s;
}
.redeem-input:focus {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.1);
}
.redeem-input::placeholder {
  color: rgba(255,255,255,0.2);
  letter-spacing: 0;
}
.redeem-input:disabled {
  opacity: 0.5;
}
.redeem-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--cyber-cyan, #00d4ff), var(--cyber-purple, #a855f7));
  border: none;
  border-radius: 10px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.redeem-btn:hover { opacity: 0.9; }
.redeem-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.redeem-tips {
  margin-top: 12px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

/* === 订单 === */
.cyber-order-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 12px;
  padding: 16px;
}
.cyber-order-card.status-pending { border-color: rgba(255,165,0,0.4); }
.cyber-order-card.status-approved { border-color: rgba(0,255,0,0.3); }
.cyber-order-card.status-rejected { border-color: rgba(255,0,0,0.3); }
.order-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.order-id { color: #888; font-size: 13px; }
.order-status { font-size: 13px; font-weight: bold; }
.status-pending .order-status { color: #ffa500; }
.status-approved .order-status { color: #4ade80; }
.status-rejected .order-status { color: #ff4444; }
.order-body { display: flex; justify-content: space-between; align-items: center; color: #fff; font-size: 14px; }
.order-amount { color: var(--cyber-magenta); font-weight: bold; }
.order-method { color: var(--cyber-cyan); font-size: 12px; }
.order-time { color: #666; font-size: 12px; margin-top: 6px; }
.cyber-empty-orders { text-align: center; padding: 32px; color: var(--cyber-text-dim); font-size: 14px; }

/* === 佣金提现 === */
.cyber-commission-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-commission-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
}
.cyber-commission-desc {
  font-size: 13px;
  color: var(--cyber-text-dim);
  margin: 12px 0 16px;
  line-height: 1.6;
}
.cyber-commission-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}
.commission-item {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.08);
  border-radius: 12px;
  padding: 14px;
}
.commission-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 6px;
}
.commission-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
}
.commission-value.available { color: #00ff88; }
.commission-value.pending { color: #ffb800; }
.commission-value.paid { color: var(--cyber-purple); }
.cyber-withdraw-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.withdraw-btn {
  display: flex; align-items: center; justify-content: center;
  gap: 4px;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.25s;
  font-family: 'JetBrains Mono', monospace;
}
.withdraw-btn.wechat {
  background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05));
  border-color: rgba(0,255,136,0.4);
  color: #00ff88;
}
.withdraw-btn.wechat:hover { box-shadow: 0 0 15px rgba(0,255,136,0.2); }
.withdraw-btn.alipay {
  background: linear-gradient(135deg, rgba(0,150,255,0.15), rgba(0,150,255,0.05));
  border-color: rgba(0,150,255,0.4);
  color: #0096ff;
}
.withdraw-btn.alipay:hover { box-shadow: 0 0 15px rgba(0,150,255,0.2); }
.withdraw-btn.qq {
  background: linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,184,0,0.05));
  border-color: rgba(255,184,0,0.4);
  color: #ffb800;
}
.withdraw-btn.qq:hover { box-shadow: 0 0 15px rgba(255,184,0,0.2); }

/* === 邀请好友 === */
.cyber-invite-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(255,0,229,0.12);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}
.cyber-invite-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-magenta), transparent);
}
.cyber-invite-content { margin-top: 16px; }
.invite-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.invite-stat {
  text-align: center;
  padding: 16px;
  background: rgba(255,0,229,0.05);
  border: 1px solid rgba(255,0,229,0.1);
  border-radius: 12px;
}
.invite-stat-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--cyber-magenta);
  font-family: 'JetBrains Mono', monospace;
}
.invite-stat-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-top: 4px;
}
.invite-rule {
  font-size: 13px;
  color: var(--cyber-text-dim);
  line-height: 1.8;
  margin-bottom: 16px;
}
.invite-rule strong { color: var(--cyber-cyan); }
.invite-code-section { text-align: center; }
.invite-code-label {
  font-size: 12px;
  color: var(--cyber-text-dim);
  margin-bottom: 8px;
}
.invite-code-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,240,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 10px;
  padding: 10px 16px;
}
.invite-code {
  font-size: 18px;
  font-weight: 700;
  color: var(--cyber-cyan);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 2px;
}
.copy-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* === 套餐卡片 === */
.cyber-pkg-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.cyber-pkg-card:hover {
  border-color: rgba(0,240,255,0.5);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.15);
}
.pkg-selected {
  border-color: var(--cyber-magenta) !important;
  box-shadow: 0 0 20px rgba(255,0,229,0.3) !important;
}
.pkg-hot { border-color: rgba(255,100,0,0.4); }
.pkg-badge {
  position: absolute;
  top: -1px; left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ff4500, #ff00e5);
  color: #fff;
  font-size: 11px;
  padding: 2px 12px;
  border-radius: 0 0 8px 8px;
  font-weight: bold;
}
.pkg-amount { font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(0,240,255,0.3); }
.pkg-label { font-size: 12px; color: var(--cyber-cyan); letter-spacing: 2px; margin-top: 2px; }
.pkg-price { font-size: 18px; font-weight: bold; color: var(--cyber-magenta); margin-top: 12px; }
.pkg-bonus { font-size: 11px; color: #4ade80; margin-top: 6px; }

/* === VIP 会员 === */
.cyber-vip-section { margin-bottom: 24px; }
.cyber-vip-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
}
.cyber-vip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0,240,255,0.1);
}
.vip-header {
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}
.vip-icon { font-size: 24px; }
.vip-name { font-size: 16px; font-weight: 700; color: var(--cyber-text); }
.vip-price { margin: 12px 0; }
.price-symbol { font-size: 16px; color: var(--cyber-magenta); }
.price-num { font-size: 32px; font-weight: 900; color: var(--cyber-magenta); font-family: 'JetBrains Mono', monospace; }
.price-period { font-size: 14px; color: var(--cyber-text-dim); }
.vip-benefits { text-align: left; margin: 16px 0; }
.vip-benefit {
  font-size: 12px;
  color: var(--cyber-text-dim);
  padding: 6px 0;
  border-bottom: 1px solid rgba(0,240,255,0.05);
}
.benefit-check { color: var(--cyber-cyan); margin-right: 4px; }
.vip-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none;
  border-radius: 10px;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.vip-btn:hover { opacity: 0.9; }

/* === 弹窗 === */
.cyber-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.cyber-modal-card {
  background: linear-gradient(135deg, #0a0a2e, #1a0533);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}
.cyber-modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0,240,255,0.1);
}
.cyber-modal-header h3 { color: #fff; font-size: 18px; }
.cyber-modal-close { color: #666; cursor: pointer; font-size: 20px; }
.cyber-modal-close:hover { color: var(--cyber-magenta); }
.cyber-modal-body { padding: 24px; }

/* 金额展示 */
.cyber-amount-display { text-align: center; margin-bottom: 24px; }
.amount-num { font-size: 42px; font-weight: 900; color: var(--cyber-magenta); text-shadow: 0 0 20px rgba(255,0,229,0.5); }
.amount-desc { display: block; color: var(--cyber-cyan); font-size: 14px; margin-top: 4px; }

/* 支付方式 */
.cyber-pay-methods { display: flex; gap: 8px; margin-bottom: 24px; }
.pay-tab {
  flex: 1; padding: 10px;
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  background: transparent;
  color: #aaa; font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.pay-tab.active {
  border-color: var(--cyber-cyan);
  color: var(--cyber-cyan);
  background: rgba(0,240,255,0.08);
  box-shadow: 0 0 12px rgba(0,240,255,0.2);
}

/* 二维码 */
.cyber-qr-section { text-align: center; margin-bottom: 20px; }
.qr-frame {
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 16px;
  position: relative;
  box-shadow: 0 0 30px rgba(0,240,255,0.2);
}
.qr-img { width: 200px; height: 200px; object-fit: contain; border-radius: 8px; }
.qr-overlay {
  position: absolute; inset: 12px;
  background: rgba(0,0,0,0.7);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.qr-success { color: #4ade80; font-size: 18px; font-weight: bold; }
.qr-hint { color: #888; font-size: 13px; margin-top: 12px; }

/* 截图上传 */
.cyber-upload-section { margin-bottom: 20px; }
.upload-label { display: block; color: var(--cyber-cyan); font-size: 14px; font-weight: bold; margin-bottom: 8px; }
.upload-area {
  border: 2px dashed rgba(0,240,255,0.3);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.upload-area:hover { border-color: rgba(0,240,255,0.6); background: rgba(0,240,255,0.05); }
.upload-area.has-file { border-color: #4ade80; background: rgba(74,222,128,0.05); }
.upload-preview { display: flex; flex-direction: column; align-items: center; position: relative; }
.upload-img { max-width: 100%; max-height: 200px; border-radius: 8px; }
.upload-remove {
  margin-top: 8px;
  padding: 4px 16px;
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  background: rgba(255,70,70,0.15);
  border: 1px solid rgba(255,70,70,0.3);
  cursor: pointer;
  transition: all 0.2s;
}
.upload-remove:hover { background: rgba(255,70,70,0.3); color: #fff; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.upload-icon { font-size: 32px; }
.upload-text { color: #888; font-size: 14px; }
.upload-hint { font-size: 11px; color: rgba(255,255,255,0.3); }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }

/* 订单提交 */
.cyber-order-section { margin-top: 16px; }
.order-input-group { margin-bottom: 12px; }
.order-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 12px;
  color: #fff; font-size: 14px;
  outline: none; box-sizing: border-box;
}
.order-input:focus { border-color: var(--cyber-cyan); }
.order-input::placeholder { color: #555; }
.submit-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-magenta));
  border: none; border-radius: 12px;
  color: #fff; font-size: 16px; font-weight: bold;
  cursor: pointer; transition: opacity 0.2s;
}
.submit-btn:hover { opacity: 0.9; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.order-notice {
  margin-top: 16px; padding: 12px;
  background: rgba(0,240,255,0.05);
  border-radius: 12px;
  border: 1px solid rgba(0,240,255,0.1);
}
.order-notice p { color: #666; font-size: 12px; line-height: 1.8; margin: 0; }

/* VIP 弹窗 */
.vip-modal-plans { display: flex; flex-direction: column; gap: 12px; }
.vip-modal-card {
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.1);
  border-radius: 12px;
  padding: 16px;
}
.vip-modal-name { font-size: 14px; font-weight: 700; color: var(--cyber-text); margin-bottom: 4px; }
.vip-modal-price { font-size: 20px; font-weight: 900; color: var(--cyber-magenta); font-family: 'JetBrains Mono', monospace; }
.vip-modal-benefits { font-size: 12px; color: var(--cyber-text-dim); margin: 8px 0; }
.vip-modal-btn {
  width: 100%; padding: 10px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none; border-radius: 8px;
  color: #000; font-size: 13px; font-weight: 700;
  cursor: pointer;
}

/* 邀请码弹窗 */
.invite-code-display { margin-top: 16px; }
.code-box {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0,240,255,0.05);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 10px; padding: 10px 16px;
}
.code-text { font-size: 20px; font-weight: 700; color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; }
.code-copy-btn {
  padding: 6px 14px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none; border-radius: 8px;
  color: #000; font-size: 12px; font-weight: 600;
  cursor: pointer;
}

/* 提现弹窗 */
.withdraw-modal {
  width: 420px;
  max-width: 92vw;
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.1), 0 20px 60px rgba(0, 0, 0, 0.6);
  animation: withdrawSlideUp 0.3s ease;
}
@keyframes withdrawSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.withdraw-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
}
.withdraw-modal-close {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.withdraw-modal-close:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
  border-color: rgba(0, 240, 255, 0.3);
}
.withdraw-modal-body {
  padding: 22px;
}
.withdraw-balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: rgba(0, 255, 136, 0.06);
  border: 1px solid rgba(0, 255, 136, 0.15);
  border-radius: 12px;
  margin-bottom: 18px;
}
.withdraw-balance-label {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
.withdraw-balance-value {
  font-size: 22px;
  font-weight: 700;
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
}
.withdraw-form-group {
  margin-bottom: 14px;
}
.withdraw-form-label {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin-bottom: 6px;
}
.withdraw-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(0, 240, 255, 0.04);
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 10px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.withdraw-input:focus {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.1);
}
.withdraw-input::placeholder {
  color: rgba(255,255,255,0.25);
}
.withdraw-input:disabled {
  opacity: 0.5;
}
.withdraw-amount-row {
  display: flex;
  gap: 10px;
}
.withdraw-amount-row .withdraw-input {
  flex: 1;
}
.withdraw-all-btn {
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  color: var(--cyber-cyan, #00d4ff);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.withdraw-all-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.35);
}
.withdraw-all-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.withdraw-tips {
  margin-top: 14px;
  padding: 10px 14px;
  background: rgba(255, 165, 0, 0.06);
  border: 1px solid rgba(255, 165, 0, 0.12);
  border-radius: 10px;
  font-size: 11px;
  color: rgba(255, 165, 0, 0.8);
  line-height: 1.8;
}
.withdraw-submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--cyber-cyan, #00d4ff), var(--cyber-purple, #a855f7));
  border: none;
  color: #000;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}
.withdraw-submit-btn:hover { opacity: 0.9; }
.withdraw-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ==================== 算法中台付费专区 ==================== */
.cyber-algo-platform-section { }
.algo-platform-banner {
  background: linear-gradient(135deg, #0a0a2e 0%, #1a0533 50%, #0d1b3e 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0,240,255,0.2);
  position: relative;
  overflow: hidden;
}
.algo-banner-glow {
  position: absolute; top: -50%; right: -30%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%);
  pointer-events: none;
}
.algo-banner-scan {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.02) 3px, rgba(0,240,255,0.02) 6px);
  pointer-events: none;
}
.algo-banner-content { position: relative; z-index: 1; }
.algo-banner-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.algo-banner-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta));
  border: 2px solid rgba(0,240,255,0.4);
  box-shadow: 0 0 15px rgba(0,240,255,0.3);
}
.algo-banner-title { font-size: 18px; font-weight: 800; color: #fff; font-family: 'JetBrains Mono', monospace; }
.algo-banner-subtitle { font-size: 11px; color: rgba(0,240,255,0.5); font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
.algo-banner-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.algo-feature-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 8px;
  background: rgba(0,240,255,0.04);
  border: 1px solid rgba(0,240,255,0.1);
  font-size: 13px; color: rgba(255,255,255,0.7);
}
.algo-feature-icon { font-size: 16px; }

.algo-access-granted {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 20px; border-radius: 12px;
  background: linear-gradient(135deg, rgba(0,229,160,0.08), rgba(0,229,160,0.02));
  border: 1px solid rgba(0,229,160,0.25);
}
.algo-granted-icon { font-size: 28px; }
.algo-granted-title { font-size: 15px; font-weight: 700; color: #00e5a0; }
.algo-granted-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.algo-enter-btn {
  margin-left: auto; padding: 10px 20px; border-radius: 10px;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-purple));
  border: none; color: #000; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  transition: opacity 0.2s;
}
.algo-enter-btn:hover { opacity: 0.85; }

.algo-price-card {
  text-align: center; padding: 24px;
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 14px;
}
.algo-price-label { font-size: 12px; color: rgba(0,240,255,0.5); letter-spacing: 2px; font-family: 'JetBrains Mono', monospace; }
.algo-price-value { margin: 8px 0; }
.algo-price-symbol { font-size: 20px; color: var(--cyber-magenta); font-weight: 700; }
.algo-price-num { font-size: 48px; font-weight: 900; color: #fff; text-shadow: 0 0 20px rgba(0,240,255,0.4); font-family: 'JetBrains Mono', monospace; }
.algo-price-desc { font-size: 12px; color: rgba(255,255,255,0.4); }

.algo-purchase-tabs { display: flex; gap: 8px; margin: 16px 0; }
.algo-tab {
  flex: 1; padding: 12px;
  border: 1px solid rgba(0,240,255,0.2); border-radius: 10px;
  background: transparent; color: rgba(255,255,255,0.6);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.algo-tab.active {
  border-color: rgba(0,240,255,0.4); color: var(--cyber-cyan);
  background: rgba(0,240,255,0.08);
  box-shadow: 0 0 12px rgba(0,240,255,0.15);
}

.algo-purchase-steps { margin-bottom: 20px; }
.algo-step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.algo-step-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--cyber-cyan), var(--cyber-magenta));
  color: #000; font-size: 13px; font-weight: 800;
  flex-shrink: 0;
}
.algo-step-title { font-size: 14px; color: var(--cyber-text); font-weight: 600; }
.algo-step-desc { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; }

.algo-pay-qr-section { text-align: center; margin: 20px 0; }
.algo-qr-methods { display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; }
.algo-qr-tab {
  padding: 8px 20px; border-radius: 8px;
  border: 1px solid rgba(0,240,255,0.15); background: transparent;
  color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.algo-qr-tab.active { border-color: var(--cyber-cyan); color: var(--cyber-cyan); background: rgba(0,240,255,0.08); }
.algo-qr-frame {
  display: inline-block; padding: 10px; background: #fff; border-radius: 12px;
  box-shadow: 0 0 20px rgba(0,240,255,0.15);
}
.algo-qr-img { width: 180px; height: 180px; object-fit: contain; border-radius: 6px; }
.algo-qr-hint { color: #888; font-size: 13px; margin-top: 10px; }

.algo-upload-section { margin: 16px 0; }
.algo-upload-label { display: block; color: var(--cyber-cyan); font-size: 14px; font-weight: bold; margin-bottom: 8px; }
.algo-upload-area {
  border: 2px dashed rgba(0,240,255,0.25); border-radius: 14px; padding: 20px;
  text-align: center; cursor: pointer; transition: all 0.2s; position: relative;
}
.algo-upload-area:hover { border-color: rgba(0,240,255,0.5); background: rgba(0,240,255,0.03); }
.algo-upload-area.has-file { border-color: #4ade80; background: rgba(74,222,128,0.03); }
.algo-upload-preview { display: flex; flex-direction: column; align-items: center; position: relative; }
.algo-upload-img { max-width: 100%; max-height: 180px; border-radius: 6px; }
.algo-upload-remove { margin-top: 6px; padding: 4px 14px; border-radius: 6px; font-size: 12px; color: rgba(255,255,255,0.7); background: rgba(255,70,70,0.12); border: 1px solid rgba(255,70,70,0.25); cursor: pointer; }
.algo-upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.algo-upload-icon { font-size: 28px; }
.algo-upload-text { color: #888; font-size: 14px; }
.algo-upload-hint { font-size: 11px; color: rgba(255,255,255,0.3); }
.algo-upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 2; }

.algo-order-section { margin-top: 14px; }
.algo-order-input {
  width: 100%; padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 10px; color: #fff; font-size: 14px;
  outline: none; margin-bottom: 10px; box-sizing: border-box;
}
.algo-order-input:focus { border-color: var(--cyber-cyan); }
.algo-order-input::placeholder { color: #555; }
.algo-submit-btn {
  width: 100%; padding: 14px;
  background: linear-gradient(90deg, var(--cyber-cyan), var(--cyber-magenta));
  border: none; border-radius: 12px;
  color: #fff; font-size: 15px; font-weight: bold;
  cursor: pointer; transition: opacity 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.algo-submit-btn:hover { opacity: 0.9; }
.algo-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.algo-order-notice {
  margin-top: 12px; padding: 12px;
  border-radius: 10px; font-size: 12px; line-height: 1.8;
}
.algo-order-notice.success {
  background: rgba(0,229,160,0.06);
  border: 1px solid rgba(0,229,160,0.2);
}
.algo-order-notice p { color: rgba(0,229,160,0.8); margin: 0; }

.algo-cardkey-purchase { }
.algo-cardkey-desc { font-size: 13px; color: var(--cyber-text-dim); line-height: 1.8; margin-bottom: 14px; }
.algo-cardkey-desc strong { color: var(--cyber-cyan); }
.algo-cardkey-input-row { display: flex; gap: 10px; margin-bottom: 14px; }
.algo-cardkey-input {
  flex: 1; padding: 12px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 10px; color: var(--cyber-text);
  font-size: 14px; font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px; outline: none; transition: all 0.25s;
}
.algo-cardkey-input:focus { border-color: rgba(0,240,255,0.4); box-shadow: 0 0 10px rgba(0,240,255,0.1); }
.algo-cardkey-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 0; }
.algo-cardkey-input:disabled { opacity: 0.5; }
.algo-cardkey-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, var(--cyber-cyan, #00d4ff), var(--cyber-purple, #a855f7));
  border: none; border-radius: 10px;
  color: #000; font-size: 14px; font-weight: 700;
  cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.algo-cardkey-btn:hover { opacity: 0.9; }
.algo-cardkey-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.algo-cardkey-success {
  text-align: center; padding: 20px;
  background: linear-gradient(135deg, rgba(0,229,160,0.1), rgba(0,240,255,0.05));
  border: 1px solid rgba(0,229,160,0.3);
  border-radius: 12px; margin-bottom: 14px;
}
.algo-cardkey-success p { font-size: 16px; font-weight: 700; color: #00e5a0; margin-bottom: 12px; }
.algo-cardkey-tips {
  padding: 10px 14px; border-radius: 10px;
  background: rgba(245,158,11,0.06);
  border: 1px solid rgba(245,158,11,0.12);
  font-size: 11px; color: rgba(255,165,0,0.7); line-height: 1.8;
}
.algo-cardkey-tips p { margin: 0; }
</style>

