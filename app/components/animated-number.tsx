import NumberFlow, { continuous } from '@number-flow/react'
import { Settings } from 'luxon'
import { useEffect, useState, useTransition } from 'react'
import { BESPOKE_NUMBER_FORMAT_SUFFIXES } from '~/utils/constants';
import { get_compact_prefix_and_value } from '~/utils/functions';
import type { NumberFormat } from '~/utils/types';

export default function AnimatedNumber({
    value,
    format,
    animate = true,
    scaleUnit = false
}: {
    value: number
    format: NumberFormat | undefined
    animate?: boolean
    scaleUnit?: boolean
}) {
    const [state, setState] = useState(0);
    const [prefix, setPrefix] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        startTransition(() => {
            if (typeof format?.fixedScaleFactor === "number") {
                setPrefix('');
                setState(value / format.fixedScaleFactor);
            } else if (BESPOKE_NUMBER_FORMAT_SUFFIXES.includes(format?.suffix ?? '')) {
                const [p, v] = get_compact_prefix_and_value(value);
                setPrefix(p);
                setState(v);
            } else {
                setPrefix('');
                setState(value);
            }
        });
    }, [value]);

    return (
        <NumberFlow
            key={value >= 0 ? 'positive' : 'negative'}
            value={state}
            locales={Settings.defaultLocale ?? 'en-US'}
            format={format?.format}
            plugins={[continuous]}
            suffix={` ${prefix}${format?.suffix ?? ''}`}
            transformTiming={{ duration: 100, easing: 'ease-in-out ' }}
            spinTiming={{ duration: 100, easing: 'ease-in-out ' }}
            opacityTiming={{ duration: 100, easing: 'ease-out' }}
            className={scaleUnit ? 'scale-unit' : ''}
            animated={animate}
        />
    )
}