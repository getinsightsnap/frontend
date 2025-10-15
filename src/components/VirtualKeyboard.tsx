import React, { useState } from 'react';
import { Keyboard, Space, Delete } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface VirtualKeyboardProps {
  onTextChange: (text: string) => void;
  languages: Language[];
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onTextChange, languages }) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showKeyboardSettings, setShowKeyboardSettings] = useState(false);
  const [keyboardLanguage, setKeyboardLanguage] = useState('en');
  const [virtualText, setVirtualText] = useState('');

  const keyboardLayouts: Record<string, string[][]> = {
    en: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    es: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'é', 'í', 'ó', 'ú', 'ü', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ü']
    ],
    fr: [
      ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
      ['w', 'x', 'c', 'v', 'b', 'n'],
      ['à', 'â', 'ç', 'é', 'è', 'ê', 'ë', 'î', 'ï', 'ô'],
      ['ù', 'û', 'ü', 'ÿ', 'À', 'Â', 'Ç', 'É', 'È', 'Ê'],
      ['Ë', 'Î', 'Ï', 'Ô', 'Ù', 'Û', 'Ü', 'Ÿ']
    ],
    de: [
      ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
      ['y', 'x', 'c', 'v', 'b', 'n', 'm']
    ],
    pt: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'à', 'â', 'ã', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú'],
      ['Á', 'À', 'Â', 'Ã', 'Ç', 'É', 'Ê', 'Í', 'Ó', 'Ô', 'Õ', 'Ú']
    ],
    it: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['à', 'è', 'é', 'ì', 'ò', 'ù', 'À', 'È', 'É', 'Ì', 'Ò', 'Ù']
    ],
    ru: [
      ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
      ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
      ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю']
    ],
    ar: [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
      ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
      ['ذ', 'د', 'ز', 'ر', 'و', 'ة', 'ى', 'ء']
    ],
    hi: [
      ['औ', 'ै', 'ा', 'ी', 'ू', 'ब', 'ह', 'ग', 'द', 'ज', 'ड'],
      ['ो', 'े', '्', 'ि', 'ु', 'प', 'र', 'क', 'त', 'च', 'ट'],
      ['ॉ', 'ं', 'म', 'न', 'व', 'ल', 'स', 'य']
    ],
    zh: [
      ['拼', '音', '输', '入', '法', '中', '文', '键', '盘', '布', '局'],
      ['汉', '字', '输', '入', '方', '式', '简', '体', '中', '文'],
      ['繁', '体', '字', '符', '输', '入']
    ],
    ja: [
      ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
      ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'を'],
      ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', 'ん']
    ],
    ko: [
      ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
      ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
      ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
    ],
    nl: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
      ['á', 'à', 'ä', 'é', 'è', 'ë', 'í', 'ï', 'ó', 'ò', 'ö', 'ú'],
      ['ù', 'ü', 'ý', 'ÿ', 'Á', 'À', 'Ä', 'É', 'È', 'Ë', 'Í', 'Ï'],
      ['Ó', 'Ò', 'Ö', 'Ú', 'Ù', 'Ü', 'Ý', 'Ÿ']
    ]
  };

  const handleKeyboardInput = (key: string) => {
    if (key === 'SPACE') {
      setVirtualText(prev => prev + ' ');
    } else if (key === 'DELETE') {
      setVirtualText(prev => prev.slice(0, -1));
    } else {
      setVirtualText(prev => prev + key);
    }
  };

  const transferToSearch = () => {
    onTextChange(virtualText);
    setVirtualText('');
    setShowKeyboard(false);
  };

  const currentKeyboardLanguage = languages.find(lang => lang.code === keyboardLanguage);

  return (
    <>
      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
            {/* Keyboard Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentKeyboardLanguage?.flag} {currentKeyboardLanguage?.name} Keyboard
                </span>
              </div>
              <div className="flex items-center gap-2">
                {virtualText && (
                  <button
                    onClick={transferToSearch}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Use Text
                  </button>
                )}
                <button
                  onClick={() => setShowKeyboard(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Virtual Text Display */}
            {virtualText && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-900">{virtualText}</p>
              </div>
            )}

            {/* Keyboard Layout */}
            <div className="space-y-2">
              {keyboardLayouts[keyboardLanguage as keyof typeof keyboardLayouts]?.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {row.map((key, keyIndex) => (
                    <button
                      key={keyIndex}
                      onClick={() => handleKeyboardInput(key)}
                      className="min-w-[40px] h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
              
              {/* Special Keys Row */}
              <div className="flex justify-center gap-1 mt-3">
                <button
                  onClick={() => handleKeyboardInput('SPACE')}
                  className="px-8 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                >
                  <Space className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleKeyboardInput('DELETE')}
                  className="px-4 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm font-medium transition-colors"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Settings Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowKeyboardSettings(!showKeyboardSettings)}
            className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Keyboard className="w-5 h-5 text-gray-700" />
          </button>
          
          {showKeyboardSettings && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Keyboard Language</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setKeyboardLanguage(language.code);
                        setShowKeyboard(language.code !== 'en');
                        setShowKeyboardSettings(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span>{language.flag}</span>
                      <span className="text-sm">{language.name}</span>
                      {keyboardLanguage === language.code && (
                        <span className="ml-auto text-blue-600 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

