<?php

namespace App\Concerns;

trait MapsLegacyAttributes
{
    /**
     * Define the attribute mapping in the model using:
     * protected $legacyMapping = ['english_name' => 'spanish_name'];
     */

    public function getAttribute($key)
    {
        if (property_exists($this, 'legacyMapping') && array_key_exists($key, $this->legacyMapping)) {
            $key = $this->legacyMapping[$key];
        }

        return parent::getAttribute($key);
    }

    public function setAttribute($key, $value)
    {
        if (property_exists($this, 'legacyMapping') && array_key_exists($key, $this->legacyMapping)) {
            $key = $this->legacyMapping[$key];
        }

        return parent::setAttribute($key, $value);
    }

    public function attributesToArray()
    {
        $attributes = parent::attributesToArray();
        
        if (property_exists($this, 'legacyMapping')) {
            foreach ($this->legacyMapping as $english => $spanish) {
                if (array_key_exists($spanish, $attributes)) {
                    $attributes[$english] = $attributes[$spanish];
                    unset($attributes[$spanish]);
                }
            }
        }

        return $attributes;
    }

    /**
     * We need to override getCasts so that mapped attributes get properly casted if defined using English keys
     */
    protected function castAttribute($key, $value)
    {
        if (property_exists($this, 'legacyMapping') && in_array($key, $this->legacyMapping)) {
            $englishKey = array_search($key, $this->legacyMapping);
            if ($this->hasCast($englishKey)) {
                return parent::castAttribute($englishKey, $value);
            }
        }
        return parent::castAttribute($key, $value);
    }
}
