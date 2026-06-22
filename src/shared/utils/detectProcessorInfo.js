const CPU_PATTERNS = [
  {
    test: (ua) => /Apple\s+M(\d+)\s*(Pro|Max|Ultra)?/i.exec(ua),
    format: (match) => `Apple M${match[1]}${match[2] ? ` ${match[2]}` : ''}`,
  },
  {
    test: (ua) => /Intel[^;)]*Core\s*Ultra\s*(\d+)/i.exec(ua),
    format: (match) => `Intel Core Ultra ${match[1]}`,
  },
  {
    test: (ua) => /Intel[^;)]*Core\s*i([3579])/i.exec(ua),
    format: (match) => `Intel Core i${match[1]}`,
  },
  {
    test: (ua) => /AMD\s+Ryzen\s+(\d+)\s*(\w+)?/i.exec(ua),
    format: (match) => `AMD Ryzen ${match[1]}${match[2] ? ` ${match[2]}` : ''}`,
  },
  {
    test: (ua) => /Snapdragon\s+(\w+)/i.exec(ua),
    format: (match) => `Snapdragon ${match[1]}`,
  },
  {
    test: (ua) => /MediaTek\s+(\w+)/i.exec(ua),
    format: (match) => `MediaTek ${match[1]}`,
  },
]

const normalizePlatform = (value) => {
  if (!value?.trim()) return ''
  return value.trim()
}

const formatArchitecture = (architecture, bitness) => {
  const arch = architecture?.trim().toLowerCase()
  const bits = bitness?.trim()

  if (!arch && !bits) return ''

  if (arch === 'arm' || arch === 'aarch64') {
    return bits === '64' ? 'ARM64' : 'ARM'
  }

  if (arch === 'x86') {
    return bits === '64' ? 'x64' : 'x86'
  }

  if (arch) {
    return arch.toUpperCase()
  }

  return bits ? `${bits}-bit` : ''
}

const inferModelFromHints = ({ model, architecture, platform, userAgent }) => {
  const trimmedModel = model?.trim()
  if (trimmedModel) {
    return trimmedModel
  }

  for (const pattern of CPU_PATTERNS) {
    const match = pattern.test(userAgent || '')
    if (match) {
      return pattern.format(match)
    }
  }

  const normalizedPlatform = normalizePlatform(platform).toLowerCase()
  const arch = architecture?.trim().toLowerCase()

  if (arch === 'arm' && normalizedPlatform.includes('mac')) {
    return 'Apple Silicon (M-seriya)'
  }

  if ((arch === 'x86' || arch === 'x86_64') && normalizedPlatform.includes('win')) {
    return 'Intel/AMD (taxminiy)'
  }

  if (arch === 'arm' && (normalizedPlatform.includes('android') || normalizedPlatform.includes('linux'))) {
    return 'ARM protsessor (taxminiy)'
  }

  return ''
}

export const detectProcessorInfo = async () => {
  if (typeof navigator === 'undefined') {
    return {
      processorModel: '',
      processorArchitecture: '',
      processorPlatform: '',
      cpuCores: null,
      processor: '',
    }
  }

  const userAgent = navigator.userAgent || ''
  const cpuCores =
    typeof navigator.hardwareConcurrency === 'number'
      ? navigator.hardwareConcurrency
      : null

  let architecture = ''
  let bitness = ''
  let model = ''
  let platform =
    navigator.userAgentData?.platform?.trim() ||
    navigator.platform?.trim() ||
    ''

  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const hints = await navigator.userAgentData.getHighEntropyValues([
        'architecture',
        'bitness',
        'model',
        'platform',
        'platformVersion',
      ])

      architecture = hints.architecture?.trim() || ''
      bitness = hints.bitness?.trim() || ''
      model = hints.model?.trim() || ''
      platform = hints.platform?.trim() || platform
    }
  } catch {
    // Brauzer ruxsat bermasa davom etamiz
  }

  const processorModel = inferModelFromHints({
    model,
    architecture,
    platform,
    userAgent,
  })

  const processorArchitecture = formatArchitecture(architecture, bitness)
  const processorPlatform = normalizePlatform(platform)

  return {
    processorModel,
    processorArchitecture,
    processorPlatform,
    cpuCores,
    processor: formatProcessorLabel({
      processorModel,
      processorArchitecture,
      processorPlatform,
      cpuCores,
    }),
  }
}

export const formatProcessorLabel = ({
  processorModel,
  processorArchitecture,
  processorPlatform,
  cpuCores,
  processor,
}) => {
  if (processor?.includes('yadro')) {
    return processor
  }

  const parts = []

  if (processorModel?.trim()) {
    parts.push(processorModel.trim())
  } else if (processorPlatform) {
    parts.push(processorPlatform)
  }

  if (cpuCores != null) {
    parts.push(`${cpuCores} yadro`)
  }

  if (processorArchitecture) {
    parts.push(processorArchitecture)
  }

  return parts.length ? parts.join(' · ') : '—'
}
