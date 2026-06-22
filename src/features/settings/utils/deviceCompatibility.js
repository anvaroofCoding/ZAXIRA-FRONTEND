import { formatProcessorLabel } from '@/shared/utils/detectProcessorInfo'

export const MIN_REQUIREMENTS = {
  processor: 'Intel Core i3 yoki ekvivalenti',
  ramGb: 8,
  storageGb: 256,
  minProcessorTier: 3,
  minCpuCores: 4,
}

const STORAGE_MIN_MB = MIN_REQUIREMENTS.storageGb * 1024

const PROCESSOR_EDUCATION = [
  {
    title: 'Intel Core i3 / i5 / i7 / i9',
    text: 'Raqam qancha katta bo‘lsa, protsessor odatda shuncha kuchli. Minimum — i3. i5 va i7 undan yuqori.',
  },
  {
    title: 'Apple M1 / M2 / M3 / M4',
    text: 'Mac kompyuterlardagi Apple Silicon chiplari. M1 odatda i5 darajasida, M2–M4 esa undan kuchliroq hisoblanadi.',
  },
  {
    title: 'AMD Ryzen 3 / 5 / 7 / 9',
    text: 'Ryzen 3 — i3 ga o‘xshash kirish darajasi. Ryzen 5 va 7 — o‘rta va yuqori segment.',
  },
  {
    title: 'Yadrolar soni',
    text: 'Ko‘p vazifali ishlash uchun yadrolar muhim. Kamida 4 yadro tavsiya etiladi.',
  },
  {
    title: 'Brauzer cheklovi',
    text: 'Brauzer xavfsizlik sababli protsessor modelini har doim aniq bermaydi. Shuning uchun ba’zan “taxminiy” deb ko‘rsatiladi.',
  },
]

const getProcessorTier = (processorModel, cpuCores) => {
  const model = (processorModel || '').toLowerCase()

  const appleMatch = /apple m(\d+)/i.exec(processorModel || '')
  if (appleMatch) {
    const generation = Number(appleMatch[1])
    return {
      tier: Math.min(9, 4 + generation),
      label: `Apple M${generation}`,
      estimated: false,
    }
  }

  if (/apple silicon|m-seriya/i.test(model)) {
    return { tier: 5, label: 'Apple Silicon (M-seriya)', estimated: true }
  }

  const intelMatch = /intel core i(\d)/i.exec(processorModel || '')
  if (intelMatch) {
    return {
      tier: Number(intelMatch[1]),
      label: `Intel Core i${intelMatch[1]}`,
      estimated: false,
    }
  }

  const ultraMatch = /intel core ultra/i.exec(processorModel || '')
  if (ultraMatch) {
    return { tier: 7, label: 'Intel Core Ultra', estimated: false }
  }

  const ryzenMatch = /ryzen (\d)/i.exec(processorModel || '')
  if (ryzenMatch) {
    return {
      tier: Number(ryzenMatch[1]),
      label: `AMD Ryzen ${ryzenMatch[1]}`,
      estimated: false,
    }
  }

  if (/intel\/amd/i.test(model) && cpuCores >= MIN_REQUIREMENTS.minCpuCores) {
    return { tier: 3, label: 'Intel/AMD (taxminiy)', estimated: true }
  }

  if (cpuCores >= 8) {
    return { tier: 3, label: 'Noma’lum protsessor', estimated: true }
  }

  if (cpuCores >= MIN_REQUIREMENTS.minCpuCores) {
    return { tier: 3, label: 'Noma’lum protsessor', estimated: true, warning: true }
  }

  return { tier: 0, label: processorModel || 'Aniqlanmadi', estimated: true }
}

const buildCheck = ({ key, label, requiredLabel, actualLabel, status, note }) => ({
  key,
  label,
  requiredLabel,
  actualLabel,
  status,
  note,
})

export const evaluateDeviceCompatibility = (telemetry) => {
  if (!telemetry) {
    return {
      isCompatible: false,
      overallStatus: 'fail',
      summary: 'Qurilma ma’lumotlarini o‘qib bo‘lmadi',
      checks: [],
      processorEducation: PROCESSOR_EDUCATION,
    }
  }

  const processorLabel = formatProcessorLabel({
    processorModel: telemetry.processorModel,
    processorArchitecture: telemetry.processorArchitecture,
    processorPlatform: telemetry.processorPlatform,
    cpuCores: telemetry.cpuCores,
    processor: telemetry.processor,
  })

  const tierInfo = getProcessorTier(telemetry.processorModel, telemetry.cpuCores)
  const processorPass =
    tierInfo.tier >= MIN_REQUIREMENTS.minProcessorTier &&
    (telemetry.cpuCores == null || telemetry.cpuCores >= MIN_REQUIREMENTS.minCpuCores)

  const processorCheck = buildCheck({
    key: 'processor',
    label: 'Protsessor',
    requiredLabel: MIN_REQUIREMENTS.processor,
    actualLabel: processorLabel,
    status: processorPass ? 'pass' : tierInfo.tier > 0 ? 'fail' : 'unknown',
    note: tierInfo.estimated
      ? tierInfo.warning
        ? 'Model aniq emas, lekin yadrolar soni minimumga yaqin — qo‘lda tekshirish tavsiya etiladi'
        : 'Brauzer protsessor modelini taxminiy aniqladi'
      : null,
  })

  const ramGb = telemetry.ramGb
  let ramCheck

  if (ramGb == null) {
    ramCheck = buildCheck({
      key: 'ram',
      label: 'Operativ xotira (RAM)',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.ramGb} GB`,
      actualLabel: 'Aniqlanmadi',
      status: 'unknown',
      note: 'Brauzer RAM hajmini to‘liq ko‘rsatmaydi. Kompyuteringizda kamida 8 GB borligini tekshiring.',
    })
  } else {
    ramCheck = buildCheck({
      key: 'ram',
      label: 'Operativ xotira (RAM)',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.ramGb} GB`,
      actualLabel: `${ramGb} GB (taxminiy)`,
      status: ramGb >= MIN_REQUIREMENTS.ramGb ? 'pass' : 'fail',
      note:
        ramGb < MIN_REQUIREMENTS.ramGb
          ? null
          : 'Brauzer xavfsizlik cheklovi tufayli RAM taxminiy ko‘rsatiladi',
    })
  }

  const storageQuotaMb = telemetry.storageQuotaMb
  let storageCheck

  if (storageQuotaMb == null) {
    storageCheck = buildCheck({
      key: 'storage',
      label: 'Disk xotirasi',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.storageGb} GB`,
      actualLabel: 'Aniqlanmadi',
      status: 'unknown',
      note: 'Brauzer disk hajmini to‘liq aniqlay olmaydi. Qurilmangizda 256 GB yoki ko‘proq joy borligini qo‘lda tekshiring.',
    })
  } else if (storageQuotaMb >= STORAGE_MIN_MB) {
    storageCheck = buildCheck({
      key: 'storage',
      label: 'Disk xotirasi',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.storageGb} GB`,
      actualLabel: `${Math.round(storageQuotaMb / 1024)} GB (taxminiy)`,
      status: 'pass',
      note: 'Brauzer orqali olingan taxminiy qiymat',
    })
  } else if (storageQuotaMb >= 50 * 1024) {
    storageCheck = buildCheck({
      key: 'storage',
      label: 'Disk xotirasi',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.storageGb} GB`,
      actualLabel: `${Math.round(storageQuotaMb / 1024)} GB (taxminiy)`,
      status: 'unknown',
      note: 'Brauzer disk hajmini to‘liq bermaydi. 256 GB borligini Windows/Mac sozlamalaridan tekshiring.',
    })
  } else {
    storageCheck = buildCheck({
      key: 'storage',
      label: 'Disk xotirasi',
      requiredLabel: `Kamida ${MIN_REQUIREMENTS.storageGb} GB`,
      actualLabel: `${Math.round(storageQuotaMb / 1024)} GB (taxminiy)`,
      status: 'fail',
      note: 'Disk hajmi minimumdan past ko‘rinmoqda',
    })
  }

  const checks = [processorCheck, ramCheck, storageCheck]
  const failedChecks = checks.filter((check) => check.status === 'fail')
  const unknownChecks = checks.filter((check) => check.status === 'unknown')
  const passedChecks = checks.filter((check) => check.status === 'pass')

  const isCompatible = failedChecks.length === 0 && processorPass && ramCheck.status !== 'fail'

  let overallStatus = 'fail'
  let summary = 'Qurilma minimum talablarga mos kelmaydi'

  if (isCompatible && unknownChecks.length === 0) {
    overallStatus = 'pass'
    summary = 'Qurilma dasturga mos keldi'
  } else if (isCompatible && unknownChecks.length > 0) {
    overallStatus = 'partial'
    summary = 'Asosiy talablar bajarilgan, ba’zi ko‘rsatkichlar aniqlanmadi'
  } else if (passedChecks.length > 0) {
    summary = 'Ba’zi talablar bajarilmagan — pastdagi tahlilni ko‘ring'
  }

  return {
    isCompatible,
    overallStatus,
    summary,
    checks,
    processorTier: tierInfo,
    processorEducation: PROCESSOR_EDUCATION,
    telemetrySnapshot: {
      processorLabel,
      ramGb,
      storageQuotaMb,
      cpuCores: telemetry.cpuCores,
    },
  }
}

export const getCheckChipProps = (status) => {
  if (status === 'pass') {
    return { label: 'Mos', color: 'success' }
  }

  if (status === 'fail') {
    return { label: 'Mos emas', color: 'error' }
  }

  return { label: 'Noma’lum', color: 'warning' }
}
