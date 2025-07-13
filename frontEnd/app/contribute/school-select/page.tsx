'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSchoolsByCity } from '@/lib/fetchEvents';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

// 1. 定义省份类型
type Province = 
  | '北京' | '上海' | '天津' | '重庆' 
  | '河北' | '山西' | '内蒙古'
  | '辽宁' | '吉林' | '黑龙江'
  | '江苏' | '浙江' | '安徽' | '福建' | '江西' | '山东'
  | '河南' | '湖北' | '湖南' | '广东' | '广西' | '海南'
  | '四川' | '贵州' | '云南' | '西藏'
  | '陕西' | '甘肃' | '青海' | '宁夏' | '新疆'
  | '香港' | '澳门' | '台湾';

// 2. 定义省-市数据结构
interface ProvincecityData {
  [key: string]: string[];
  北京: string[];
  上海: string[];
  天津: string[];
  重庆: string[];
  河北: string[];
  山西: string[];
  内蒙古: string[];
  辽宁: string[];
  吉林: string[];
  黑龙江: string[];
  江苏: string[];
  浙江: string[];
  安徽: string[];
  福建: string[];
  江西: string[];
  山东: string[];
  河南: string[];
  湖北: string[];
  湖南: string[];
  广东: string[];
  广西: string[];
  海南: string[];
  四川: string[];
  贵州: string[];
  云南: string[];
  西藏: string[];
  陕西: string[];
  甘肃: string[];
  青海: string[];
  宁夏: string[];
  新疆: string[];
  香港: string[];
  澳门: string[];
  台湾: string[];
}

// 3. 省-市数据（完整保留）
const PROVINCE_CITY_DATA: ProvincecityData = {
  '北京': ['北京'],
  '上海': ['上海'],
  '天津': ['天津'],
  '重庆': ['重庆'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边朝鲜族自治州'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭地区'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施土家族苗族自治州', '仙桃', '潜江', '天门', '神农架林区'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西土家族苗族自治州'],
  '广东': ['广州', '深圳', '珠海', '汕头', '佛山', '韶关', '湛江', '肇庆', '江门', '茂名', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '海南': ['海口', '三亚', '三沙', '儋州', '五指山', '琼海', '文昌', '万宁', '东方', '定安', '屯昌', '澄迈', '临高', '白沙黎族自治县', '昌江黎族自治县', '乐东黎族自治县', '陵水黎族自治县', '保亭黎族苗族自治县', '琼中黎族苗族自治县'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里地区'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏回族自治州', '甘南藏族自治州'],
  '青海': ['西宁', '海东', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭勒蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区', '石河子', '阿拉尔', '图木舒克', '五家渠', '北屯', '铁门关', '双河', '可克达拉', '昆玉', '胡杨河'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台北', '高雄', '基隆', '台中', '台南', '新竹', '嘉义', '桃园', '新北', '宜兰', '苗栗', '彰化', '南投', '云林', '屏东', '台东', '花莲', '澎湖'],
} as ProvincecityData; // 添加类型断言

export default function SchoolSelect() {
  const [confirmed, setConfirmed] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<Province | ''>('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [schools, setSchools] = useState<Record<string, string>>({});
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolZhName, setNewSchoolZhName] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadSchools = async () => {
      if (selectedCity) {
        setLoading(true);
        try {
          // 根据 getSchoolsByCity 的定义，需要两个参数
          const schoolsData = await getSchoolsByCity(selectedProvince, selectedCity);
          setSchools(schoolsData.reduce((acc, school) => {
            acc[school.id] = school.name;
            return acc;
          }, {} as Record<string, string>));
        } catch (err) {
          console.error('加载学校列表失败', err);
        } finally {
          setLoading(false);
        }
      }
    };
    loadSchools();
  }, [selectedCity, selectedProvince]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value as Province;
    setSelectedProvince(province);
    setSelectedCity('');
    setCities(province ? PROVINCE_CITY_DATA[province] : []);
  };

  const handleConfirmLocation = () => {
    if (selectedCity) {
      setIsTransitioning(true);
      setTimeout(() => {
        setConfirmed(true);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolZhName.trim()) {
      console.error('请填写完整的学校信息');
      return;
    }
    router.push(`/contribute?type=school&city=${selectedCity}&school=${encodeURIComponent(newSchoolName)}&schoolZh=${encodeURIComponent(newSchoolZhName)}`);
  };

  const handleSelectSchool = () => {
    if (selectedSchool) {
      router.push(`/contribute?type=school&city=${selectedCity}&school=${encodeURIComponent(selectedSchool)}`);
    }
  };

  const handleGoBack = () => {
    if (confirmed) {
      setIsTransitioning(true);
      setTimeout(() => {
        setConfirmed(false);
        setIsTransitioning(false);
      }, 150);
    } else {
      router.back();
    }
  };

  if (!confirmed) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="flex items-center gap-2 mt-8 mb-6">
          <button
            onClick={handleGoBack}
            className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
            aria-label="返回"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold flex-1 text-left text-gray-800">
            手动选择城市
          </h1>
        </div>

        <div className={`space-y-4 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div>
            <label className="block mb-2 text-gray-700">选择省份:</label>
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">请选择省份</option>
              {Object.keys(PROVINCE_CITY_DATA).map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-700">选择城市:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={!selectedProvince}
            >
              <option value="">请先选择省份</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleConfirmLocation}
            className={`w-full py-2 px-4 rounded-md transition-colors duration-200 ${
              !selectedCity
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={!selectedCity}
          >
            {loading ? '处理中...' : '确认选择'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="flex items-center gap-2 mt-8 mb-6">
        <button
          onClick={handleGoBack}
          className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
          aria-label="返回"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold flex-1 text-left text-gray-800">
          选择学校 - {selectedCity}
        </h1>
      </div>

      <div className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(schools).length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-medium text-gray-800">已有学校:</h2>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">选择学校</option>
                  {Object.entries(schools).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                
                <button
                  onClick={handleSelectSchool}
                  disabled={!selectedSchool}
                  className={`w-full py-2 px-4 rounded-md transition-colors duration-200 ${
                    !selectedSchool
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  选择学校
                </button>
              </div>
            )}
            
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-gray-800">或添加新学校:</h2>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="输入学校英文标识 (如: bj-school)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <input
                  type="text"
                  value={newSchoolZhName}
                  onChange={(e) => setNewSchoolZhName(e.target.value)}
                  placeholder="输入学校中文名称"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <button
                onClick={handleAddSchool}
                disabled={!newSchoolName || !newSchoolZhName}
                className={`w-full py-2 px-4 rounded-md transition-colors duration-200 ${
                  !newSchoolName || !newSchoolZhName
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                添加学校
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
